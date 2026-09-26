import { useQuery } from '@tanstack/react-query'

import { getPluginInventory } from '@/api/plugins'

export const pluginInventoryQueryKey = ['admin', 'plugins'] as const

export function usePluginInventory() {
  return useQuery({
    queryKey: pluginInventoryQueryKey,
    queryFn: getPluginInventory,
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: 1,
  })
}
