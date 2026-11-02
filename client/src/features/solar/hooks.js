import { useQuery } from '@tanstack/react-query';
import { fetchSolarEstimate } from './api';
import { QUERY_KEYS } from '../../services/queryClient';

export function useSolarEstimate() {
  return useQuery({
    queryKey: QUERY_KEYS.solar.estimate(),
    queryFn: fetchSolarEstimate,
  });
}
