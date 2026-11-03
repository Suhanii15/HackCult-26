import { Platform } from 'react-native';

// For local testing on Wi-Fi device or emulator:
// - Physical device on Wi-Fi: use PC's LAN IP (e.g. 192.168.0.191:5000)
// - Web / localhost: use http://localhost:5000
const DEV_LAN_IP = '192.168.0.191';
const PORT = '5000';

export const API_BASE_URL =
  Platform.OS === 'web'
    ? `http://localhost:${PORT}/api/v1`
    : `http://${DEV_LAN_IP}:${PORT}/api/v1`;

// Memory token cache for current session
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => {
  return authToken;
};

// Generic fetch wrapper with timeout & error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
