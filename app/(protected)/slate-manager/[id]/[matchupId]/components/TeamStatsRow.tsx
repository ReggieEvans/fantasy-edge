import { getDefensiveDeltaGrade, getOffensiveDeltaGrade } from '@/utils/delta-grade'

import { TeamStats } from '../../../_types/stats'

const TeamStatRow = ({
  stats,
  label,
  isPercent,
  isReverse,
}: {
  stats: TeamStats
  label: string
  isPercent?: boolean
  isReverse?: boolean
}) => {
  const teamDelta = stats.current_year - stats.current_year_avg

  const isDefensiveStat = label.toUpperCase().includes('PASS DEF') || label.toUpperCase().includes('RUSH DEF')

  const { grade, bgClass } = isDefensiveStat ? getDefensiveDeltaGrade(teamDelta) : getOffensiveDeltaGrade(teamDelta)

  return (
    <div className="flex flex-col gap-2">
      <div className={`uppercase text-sm font-bold ${isReverse ? 'text-right' : 'text-left'}`}>{label}</div>
      <div className={`flex flex-wrap ${isReverse ? 'flex-row-reverse' : ''}`}>
        <div className="flex flex-col text-sm font-medium w-12 mb-3">
          <div
            className={`text-muted uppercase border-b-2 border-border text-[10px] font-bold ${isReverse ? 'text-right' : 'text-left'}`}
          >
            Delta
          </div>
          <div className={`flex p-1 ${isReverse ? 'justify-end' : 'justify-start'}`}>
            <span className={`flex justify-center px-1 py-[1px] rounded text-sm font-bold w-8 ${bgClass}`}>
              {grade}
            </span>
          </div>
        </div>
        {[
          { key: 'current_year' as const, label: 'Current' },
          { key: 'home' as const, label: 'HOME' },
          { key: 'away' as const, label: 'AWAY' },
          { key: 'last_1' as const, label: 'Last' },
          { key: 'last_3' as const, label: 'Last 3' },
          { key: 'previous_year' as const, label: 'Last Year' },
          { key: 'rank' as const, label: 'Rank' },
        ].map(({ key, label }) => (
          <div key={key} className="flex flex-col text-sm font-medium w-16 mb-3">
            <div className={`text-muted uppercase border-b-2 border-border text-[10px] font-bold text-center`}>
              {label}
            </div>
            <div className={`p-1 text-center`}>
              {isPercent && label !== 'Rank' ? `${(stats[key] ?? 0 * 100).toFixed(1)}%` : stats[key]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamStatRow
