import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchUserProfile,
  fetchProfileLikedActivities,
  updateUserProfile,
} from './api';
import { queryClient, QUERY_KEYS } from '../../services/queryClient';

export function useProfile(currentUser) {
  return useQuery({
    queryKey: QUERY_KEYS.profile.me(),
    queryFn: () => fetchUserProfile(currentUser),
    initialData: currentUser || {
      fullName: 'Alex Jacob',
      district: 'Ahmedabad',
      state: 'Gujarat',
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

export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.profile.me(), updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.all });
    },
  });
}
