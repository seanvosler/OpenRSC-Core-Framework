import { useQuery } from '@tanstack/react-query'

import { getSyntheticPopulation } from '@/api/synthetic-population'

export const syntheticPopulationQueryKey = ['admin', 'synthetic-population'] as const

export function useSyntheticPopulation() {
  return useQuery({
    queryKey: syntheticPopulationQueryKey,
    queryFn: getSyntheticPopulation,
    refetchInterval: 2_000,
    retry: 1,
  })
}
