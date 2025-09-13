import { useCallback, useState } from 'react'

import { ApiPick, ApiResponse, TeamMeta } from '../types/pickem'
import { Aggression } from '../types/pickem'

export function usePickemGenerator() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [picks, setPicks] = useState<ApiPick[]>([])
  const [teams, setTeams] = useState<Record<string, TeamMeta>>({})

  const generate = useCallback(async (args: { raw_json: unknown[] | null; aggression: Aggression }) => {
    setLoading(true)
    setError(null)
    try {
      if (!args.raw_json?.length) throw new Error('Upload a JSON file first')

      const base = process.env.NEXT_PUBLIC_PYTHON_URL
      if (!base) throw new Error('Missing PYTHON URL')

      const res = await fetch(`${base}/generate-picks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      })
      if (!res.ok) throw new Error(`Failed to fetch picks (${res.status})`)

      const data: ApiResponse = await res.json()
      setPicks(data.picks ?? [])
      setTeams(data.teams ?? {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  return { isLoading, error, picks, teams, generate }
}
