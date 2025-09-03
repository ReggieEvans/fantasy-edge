'use client'

import { useParams } from 'next/navigation'

import { useGetSlatePackQuery } from '../../_api/optimizer'
import { playerColumns } from './columns'
import { DataTable } from './data-table'

export default function AiOptimizer() {
  const { id } = useParams() as { id: string }
  const { data: slatePack, isLoading, isError } = useGetSlatePackQuery(id)
  console.log(slatePack)
  console.log('rendering ai optimizer')
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <DataTable columns={playerColumns} data={slatePack?.players ?? []} />
      {/* <DataTable columns={playerColumns} data={slatePack?.matchups ?? []} /> */}
    </main>
  )
}
