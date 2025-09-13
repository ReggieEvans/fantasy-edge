'use client'

import { useParams } from 'next/navigation'

export function useSlateId() {
  const { id } = useParams<{ id: string }>()
  return id
}
