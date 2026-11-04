import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_API_PORT || '5000';

const extractHostFromUri = (uri) => {
  if (!uri || typeof uri !== 'string') return null;
  const cleaned = uri.replace(/^[a-zA-Z0-9+.-]+:\/\//, '');
  const host = cleaned.split('/')[0]?.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.expo.dev') || host.endsWith('.exp.direct')) {
    return null;
  }
  return host;
};

// Dynamically resolve API URL for physical Android/iOS devices (Expo Go), Android emulators, and local web
export const resolveApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  // Try to discover the host machine's LAN IP from Expo Constants or React Native SourceCode
  const candidateUris = [
    Constants?.expoConfig?.hostUri,
    Constants?.manifest2?.extra?.expoGo?.debuggerHost,
    Constants?.manifest?.debuggerHost,
    Constants?.linkingUri,
    NativeModules?.SourceCode?.scriptURL,
  ];

  let detectedLanHost = null;
  for (const uri of candidateUris) {
    const host = extractHostFromUri(uri);
    if (host) {
      detectedLanHost = host;
      break;
    }
  }

  // 1. If EXPO_PUBLIC_API_URL is explicitly configured:
  if (envUrl) {
    const normalizedEnvUrl = envUrl.replace(/\/+$/, '');
    const isLocalhostEnv =
      normalizedEnvUrl.includes('://localhost') ||
      normalizedEnvUrl.includes('://127.0.0.1');

    // On mobile (Android/iOS), localhost points to the phone/emulator itself rather than the dev laptop.
    if (Platform.OS !== 'web' && isLocalhostEnv) {
      if (detectedLanHost) {
        return normalizedEnvUrl.replace(/localhost|127\.0\.0\.1/, detectedLanHost);
      }
      if (Platform.OS === 'android') {
        return normalizedEnvUrl.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');
      }
    }
    return normalizedEnvUrl;
  }

  // 2. Physical device or Expo Go over LAN: use detected Metro bundler host IP
  if (Platform.OS !== 'web' && detectedLanHost) {
    return `http://${detectedLanHost}:${DEFAULT_API_PORT}/api/v1`;
  }

  // 3. Android Emulator fallback (10.0.2.2 routes to host loopback)
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_API_PORT}/api/v1`;
  }

  // 4. Web / iOS Simulator local fallback
  return `http://localhost:${DEFAULT_API_PORT}/api/v1`;
};

export const API_BASE_URL = resolveApiBaseUrl();

// Format raw fetch / Java / socket exceptions into clear, actionable user messages
export const formatNetworkError = (error, url = API_BASE_URL) => {
  const raw = String(error?.message || error || '');

  if (error?.name === 'AbortError' || raw.toLowerCase().includes('timed out')) {
    return `Connection timed out while reaching the server (${url}). Ensure the backend is running and your device is on the same Wi-Fi network.`;
  }

  if (
    raw.includes('ConnectException') ||
    raw.includes('Failed to connect') ||
    raw.includes('Network request failed') ||
    raw.includes('fetch failed') ||
    raw.includes('ECONNREFUSED') ||
    raw.includes('ENETUNREACH') ||
    raw.includes('EHOSTUNREACH')
  ) {
    return `Unable to reach the Mission LiFE server (${url}). Please verify that the backend server is running on port ${DEFAULT_API_PORT}, both devices are on the same Wi-Fi network, and your firewall allows port ${DEFAULT_API_PORT}.`;
  }

  return raw || 'Something went wrong while communicating with the server.';
};

// Memory token cache for current session
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => {
  return authToken;
};

// Generic fetch wrapper with configurable timeout & clear error handling
export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const timeoutMs = options.timeoutMs || 15000; // 15s default timeout for responsive mobile feedback

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  let timeoutId;
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    // Preserve HTTP status errors returned by the backend
    if (error.status) {
      throw error;
    }
    const formatted = new Error(formatNetworkError(error, API_BASE_URL));
    formatted.isNetworkError = true;
    formatted.cause = error;
    throw formatted;
  }
}

// Silent warm-up call to wake up server / spin-up
export const apiWarmup = async () => {
  try {
    return await request('/health', { method: 'GET' });
  } catch {
    return null;
  }
};

// Auth API
export const apiRegister = async ({ fullName, identifier, password, district, city }) => {
  const result = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, identifier, password, district, city }),
  });
  if (result.token) {
    setAuthToken(result.token);
  }
  return result;
};

export const apiLogin = async ({ identifier, password }) => {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
  if (result.token) {
    setAuthToken(result.token);
  }
  return result;
};

export const apiGetMe = async () => {
  return await request('/auth/me', {
    method: 'GET',
  });
};

// Footprint API
export const apiCalculateFootprint = async (payload) => {
  return await request('/footprint/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const apiSaveBaseline = async (payload) => {
  return await request('/footprint/baseline', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const apiGetFootprintHistory = async () => {
  return await request('/footprint/history', {
    method: 'GET',
  });
};

// User Profile API
export const apiUpdateProfile = async (updates) => {
  return await request('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};


// Leaderboard API
export const apiGetLeaderboard = async ({ scope = 'district', metric = 'green' } = {}) => {
  return await request(`/points/leaderboard?scope=${scope}&metric=${metric}`, {
    method: 'GET',
  });
};
