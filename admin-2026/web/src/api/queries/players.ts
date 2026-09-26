import { useQuery } from '@tanstack/react-query'

import { getPlayers } from '@/api/players'

export const playersQueryKey = ['admin', 'players'] as const

export function usePlayers() {
  return useQuery({
    queryKey: playersQueryKey,
    queryFn: getPlayers,
    refetchInterval: 3_000,
    retry: 1,
  })
}
