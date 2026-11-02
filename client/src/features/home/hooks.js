import { useQuery } from '@tanstack/react-query';
import { fetchHomeDashboard } from './api';
import { QUERY_KEYS } from '../../services/queryClient';

export function useHomeDashboard(currentUser) {
  return useQuery({
    queryKey: QUERY_KEYS.home.dashboard(),
    queryFn: () => fetchHomeDashboard(currentUser),
    initialData: {
      user: currentUser || {
        fullName: 'Priya Patel',
        district: 'Ahmedabad',
        totalPoints: 120,
      },
      streakDays: 4,
      targetDays: 7,
      totalPoints: currentUser?.totalPoints || 120,
      monthlyCO2Kg: 106.5,
      completedToday: false,
    },
  });
}
