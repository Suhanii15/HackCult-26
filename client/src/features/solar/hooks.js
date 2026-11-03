import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calculateSolar, fetchVendors, submitSolarEnquiry } from './api';

export const SOLAR_QUERY_KEYS = {
  all: ['solar'],
  calculation: (params) => ['solar', 'calculate', params],
  vendors: (category, district) => ['solar', 'vendors', { category, district }],
};

export function useSolarCalculation(params, { enabled = true } = {}) {
  return useQuery({
    queryKey: SOLAR_QUERY_KEYS.calculation(params),
    queryFn: () => calculateSolar(params),
    enabled: enabled && !!params?.roofAreaSqft && !!params?.monthlyBillInr,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSolarVendors({ category = 'solar_installer', district } = {}) {
  return useQuery({
    queryKey: SOLAR_QUERY_KEYS.vendors(category, district),
    queryFn: () => fetchVendors({ category, district }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubmitSolarEnquiry() {
  return useMutation({
    mutationFn: submitSolarEnquiry,
  });
}
