import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchCategories,
  fetchActivitiesByCategory,
  fetchActivityDetail,
  fetchActiveActivities,
  fetchCompletedActivities,
  fetchExpiredActivities,
  startActivity,
  alreadyAchievedActivity,
  dismissActivity,
  submitDailyCheckIn,
  fetchCycleDetails,
  fetchLikedActivities,
  toggleLikeActivity,
} from './api';
import { queryClient, QUERY_KEYS } from '../../services/queryClient';

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.activities.categories(),
    queryFn: fetchCategories,
  });
}

export function useActivities(category) {
  return useQuery({
    queryKey: QUERY_KEYS.activities.list(category),
    queryFn: () => fetchActivitiesByCategory(category),
  });
}

export function useActivityDetail(key) {
  return useQuery({
    queryKey: QUERY_KEYS.activities.detail(key),
    queryFn: () => fetchActivityDetail(key),
    enabled: Boolean(key),
  });
}

export function useActiveActivities() {
  return useQuery({
    queryKey: QUERY_KEYS.activities.active(),
    queryFn: fetchActiveActivities,
  });
}

export function useCompletedActivities() {
  return useQuery({
    queryKey: QUERY_KEYS.activities.completed(),
    queryFn: fetchCompletedActivities,
  });
}

export function useExpiredActivities() {
  return useQuery({
    queryKey: QUERY_KEYS.activities.expired(),
    queryFn: fetchExpiredActivities,
  });
}

export function useCycleDetails(cycleId) {
  return useQuery({
    queryKey: QUERY_KEYS.activities.cycle(cycleId),
    queryFn: () => fetchCycleDetails(cycleId),
    enabled: Boolean(cycleId),
  });
}

export function useStartActivity() {
  return useMutation({
    mutationFn: (activityId) => startActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.all });
    },
  });
}

export function useAlreadyAchieved() {
  return useMutation({
    mutationFn: (activityId) => alreadyAchievedActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.all });
    },
  });
}

export function useDismissActivity() {
  return useMutation({
    mutationFn: (activityId) => dismissActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities.all });
    },
  });
}

export function useDailyCheckIn() {
  return useMutation({
    mutationFn: ({ cycleId, completed, checkInDate }) =>
      submitDailyCheckIn({ cycleId, completed, checkInDate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.home.all });
    },
  });
}

export function useLikedActivities() {
  return useQuery({
    queryKey: QUERY_KEYS.activities.liked(),
    queryFn: fetchLikedActivities,
  });
}

export function useToggleLike() {
  return useMutation({
    mutationFn: (activityId) => toggleLikeActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.all });
    },
  });
}
