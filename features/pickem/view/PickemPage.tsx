'use client'

import { Pickaxe } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ErrorMessage } from '@/shared/ui/ErrorMessage'

import FeatureHeader from '../../../shared/ui/FeatureHeader'
import { NoData } from '../../../shared/ui/NoData'
import { SkeletonRows } from '../../../shared/ui/SkeletonRows'
import { useJsonFile, usePickemGenerator } from '../hooks'
import { Aggression } from '../types/pickem'
import ActionsBar from '../ui/ActionsBar'
import { PickemRows } from '../ui/PickemRows'

export default function PickemPage() {
  const [aggression, setAggression] = useState<Aggression>('Balanced')
  const { rawJson, error: fileError, onFileChange } = useJsonFile()
  const { isLoading, error: genError, picks, teams, generate } = usePickemGenerator()

  const rows = useMemo(
    () =>
      (picks || []).map(p => ({
        ...p,
        teamMeta: teams?.[p.team],
        oppMeta: teams?.[p.opp],
      })),
    [picks, teams],
  )

  const error = fileError ?? genError
  const canGenerate = !!rawJson && !isLoading

  return (
    <div className="px-6 bg-background pt-8 min-h-[calc(100vh-90px)] overflow-y-auto pb-16">
      <FeatureHeader
        icon={<Pickaxe size={20} />}
        title="Pick'em Optimizer"
        description="
          The Pick'em feature converts moneylines to no-vig win probabilities, 
          combines with public pick rates, then uses an integer optimizer to 
          pick one side per game and assign unique confidence points to maximize 
          expected points and edge vs. the field, with a mode-dependent variance penalty.
        "
      />
      <ActionsBar
        handleFileUpload={onFileChange}
        handleGenerate={() => generate({ raw_json: rawJson, aggression })}
        isLoading={isLoading}
        aggression={aggression}
        setAggression={setAggression}
        canGenerate={canGenerate}
      />

      {error && <ErrorMessage errorMessage={error} />}

      <div className="space-y-4 mt-4 px-1">
        {isLoading ? (
          [...Array(20)].map((_, i) => <SkeletonRows key={i} height={16} />)
        ) : rows?.length === 0 ? (
          <NoData
            title="Upload Data File"
            description="Upload CBS Data file to generate picks for the week."
          />
        ) : (
          <div className="overflow-x-auto bg-card rounded p-4">
            <Table>
              <TableHeader>
                <TableRow className="text-xs text-muted">
                  <TableHead className="text-center">Rank</TableHead>
                  <TableHead className="text-center">Conf</TableHead>
                  <TableHead>Matchup</TableHead>
                  <TableHead>Pick</TableHead>
                  <TableHead className="text-center">Win %</TableHead>
                  <TableHead className="text-center">Market %</TableHead>
                  <TableHead className="text-center">Edge</TableHead>
                  <TableHead className="text-center">Weekly Edge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => (
                  <PickemRows key={r.gameKey} {...r} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
