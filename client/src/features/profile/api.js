import { apiGetMe } from '../../services/api';
import {
  fetchLikedActivities as getLiked,
  fetchHiddenActivities as getHidden,
  toggleHideActivity as toggleHide,
} from '../activities/api';

export const fetchUserProfile = async (currentUser) => {
  try {
    const meData = await apiGetMe().catch(() => null);
    return meData?.user || currentUser || {
      fullName: 'Priya Patel',
      district: 'Ahmedabad',
      totalPoints: 120,
    };
  } catch {
    return currentUser || {
      fullName: 'Priya Patel',
      district: 'Ahmedabad',
      totalPoints: 120,
    };
  }
};

export const fetchProfileLikedActivities = async () => {
  return await getLiked();
};

export const fetchProfileHiddenActivities = async () => {
  return await getHidden();
};

export const restoreHiddenActivity = async (id) => {
  return await toggleHide(id);
};
