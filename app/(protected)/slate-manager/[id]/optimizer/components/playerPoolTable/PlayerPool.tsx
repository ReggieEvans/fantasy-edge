'use client'

import { useParams } from 'next/navigation'

import { useGetSlatePackQuery } from '@/app/(protected)/slate-manager/_api'

import { playerColumns } from './columns'
import { DataTable } from './data-table'

export default function PlayerPoolTable() {
  const { id } = useParams() as { id: string }
  const { data: slatePack, isLoading, isError } = useGetSlatePackQuery(id)
  console.log(slatePack)
  console.log('rendering ai optimizer')
  return (
    <div>
      <DataTable columns={playerColumns} data={slatePack?.players ?? []} />
    </div>
  )
}
