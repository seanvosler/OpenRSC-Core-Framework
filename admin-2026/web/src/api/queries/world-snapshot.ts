import { useQuery } from '@tanstack/react-query'

import { getWorldSnapshot } from '@/api/world-snapshot'

export const worldSnapshotQueryKey = (serverName: string | null) =>
  ['admin', 'world', 'snapshot', serverName] as const

export function useWorldSnapshot(serverName: string | null) {
  return useQuery({
    queryKey: worldSnapshotQueryKey(serverName),
    queryFn: () => getWorldSnapshot(serverName!),
    enabled: Boolean(serverName),
    refetchInterval: 1_000,
    retry: 1,
  })
}
