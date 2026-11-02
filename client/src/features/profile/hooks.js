import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchUserProfile,
  fetchProfileLikedActivities,
  fetchProfileHiddenActivities,
  restoreHiddenActivity,
} from './api';
import { queryClient, QUERY_KEYS } from '../../services/queryClient';

export function useProfile(currentUser) {
  return useQuery({
    queryKey: QUERY_KEYS.profile.me(),
    queryFn: () => fetchUserProfile(currentUser),
    initialData: currentUser || {
      fullName: 'Priya Patel',
      district: 'Ahmedabad',
      totalPoints: 120,
    },
  });
}

export function useProfileLikedActivities() {
  return useQuery({
    queryKey: QUERY_KEYS.profile.likedActivities(),
    queryFn: fetchProfileLikedActivities,
  });
}

export function useProfileHiddenActivities() {
  return useQuery({
    queryKey: QUERY_KEYS.profile.hiddenActivities(),
    queryFn: fetchProfileHiddenActivities,
  });
}

export function useRestoreHiddenActivity() {
  return useMutation({
    mutationFn: restoreHiddenActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities.all });
    },
  });
}
