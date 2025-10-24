'use client'

import { useParams } from 'next/navigation'

import { getErrorMessage } from '@/utils/getErrorMessage'

import { useGetSlateQuery } from '../../_api/slates.api'
import ContestSelection from '../ui/ContestSelection'

export default function ContestSelectionPage() {
  const { id } = useParams() as { id: string }
  const { data: slate, isLoading, isError, error } = useGetSlateQuery(id)

  if (isLoading) return <div className="p-6">Loading active slate…</div>
  if (isError) return <div className="p-6 text-red-500">Error: {getErrorMessage(error)}</div>
  if (!slate?.dk_draft_group_id) {
    return <div className="p-6">No active slate with a Draft Group.</div>
  }

  return <ContestSelection sport={slate.sport} draftGroupId={slate.dk_draft_group_id} />
}
