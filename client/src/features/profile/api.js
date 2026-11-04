import { apiGetMe, apiUpdateProfile } from '../../services/api';
import { fetchLikedActivities as getLiked } from '../activities/api';

// In-memory cache for user profile ensuring offline & immediate persistence across app
let inMemoryUser = null;

export const getCachedUserProfile = () => inMemoryUser;

export const fetchUserProfile = async (currentUser) => {
  if (inMemoryUser) {
    return { ...(currentUser || {}), ...inMemoryUser };
  }
  try {
    const meData = await apiGetMe().catch(() => null);
    const user = meData?.user || currentUser || {
      fullName: 'Alex Jacob',
      district: 'Ahmedabad',
      state: 'Gujarat',
      totalPoints: 120,
    };
    inMemoryUser = { ...(inMemoryUser || {}), ...user };
    return inMemoryUser;
  } catch {
    const fallback = currentUser || {
      fullName: 'Alex Jacob',
      district: 'Ahmedabad',
      state: 'Gujarat',
      totalPoints: 120,
    };
    inMemoryUser = { ...(inMemoryUser || {}), ...fallback };
    return inMemoryUser;
  }
};

export const updateUserProfile = async (updates) => {
  try {
    const res = await apiUpdateProfile(updates).catch(() => null);
    if (res?.data) {
      inMemoryUser = { ...(inMemoryUser || {}), ...res.data, ...updates };
      return inMemoryUser;
    }
  } catch (err) {
    console.warn('apiUpdateProfile offline/fallback:', err.message);
  }
  inMemoryUser = { ...(inMemoryUser || {}), ...updates };
  return inMemoryUser;
};

export const fetchProfileLikedActivities = async () => {
  return await getLiked();
};
