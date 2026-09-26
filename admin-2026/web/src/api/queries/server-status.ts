import { useQuery } from '@tanstack/react-query'

import { getServerStatus } from '@/api/status'

export const serverStatusQueryKey = ['admin', 'server-status'] as const

export function useServerStatus() {
  return useQuery({
    queryKey: serverStatusQueryKey,
    queryFn: getServerStatus,
    refetchInterval: 2_000,
    retry: 1,
  })
}
