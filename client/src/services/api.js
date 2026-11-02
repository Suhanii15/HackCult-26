import { NativeModules, Platform } from 'react-native';

// Dynamically resolve API URL: uses EXPO_PUBLIC_API_URL if set, or extracts Metro host IP for mobile devices
const resolveApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS !== 'web' && NativeModules?.SourceCode?.scriptURL) {
    try {
      const rawUrl = NativeModules.SourceCode.scriptURL;
      const host = rawUrl.split('://')[1]?.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5000/api/v1`;
      }
    } catch {
      // Fallback below
    }
  }
  return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = resolveApiBaseUrl();

// Memory token cache for current session
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => {
  return authToken;
};

// Generic fetch wrapper with 45s timeout & error handling
export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for cold start / Render spins

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
    if (error.name === 'AbortError') {
      throw new Error('Network request timed out. Please check your connection.');
    }
    throw error;
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
