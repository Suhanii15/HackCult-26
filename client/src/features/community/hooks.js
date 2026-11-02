import { useQuery } from '@tanstack/react-query';
import { fetchCommunityOverview } from './api';
import { QUERY_KEYS } from '../../services/queryClient';

export function useCommunityOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.community.overview(),
    queryFn: fetchCommunityOverview,
  });
}
