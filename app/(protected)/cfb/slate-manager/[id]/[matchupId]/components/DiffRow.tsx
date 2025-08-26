import { MatchupDTO } from '@/app/(protected)/cfb/slate-manager/_dto/matchup.dto'
import { NestedStatKey } from '@/app/(protected)/cfb/slate-manager/_types/diffRow'
import { getMatchupGrade } from '@/utils/matchup-grade'

interface DiffRowProps {
  label: string
  data: MatchupDTO
  homeOffense: NestedStatKey
  homeDefense: NestedStatKey
  awayOffense: NestedStatKey
  awayDefense: NestedStatKey
  isReversed?: boolean
}

export const DiffRow = ({
  label,
  data,
  homeOffense,
  homeDefense,
  awayOffense,
  awayDefense,
}: DiffRowProps) => {
  const getCurrentYear = ([statType, side]: NestedStatKey) => data[statType][side]?.current_year ?? 0
  const getCurrentYearAvg = ([statType, side]: NestedStatKey) => data[statType][side]?.current_year_avg ?? 0

  const homeCurrentOffense = getCurrentYear(homeOffense)
  const homeCurrentOffenseAvg = getCurrentYearAvg(homeOffense)
  const homeCurrentDefense = getCurrentYear(homeDefense)
  const homeCurrentDefenseAvg = getCurrentYearAvg(homeDefense)

  const awayCurrentOffense = getCurrentYear(awayOffense)
  const awayCurrentOffenseAvg = getCurrentYearAvg(awayOffense)
  const awayCurrentDefense = getCurrentYear(awayDefense)
  const awayCurrentDefenseAvg = getCurrentYearAvg(awayDefense)

  const homeOffenseDelta = homeCurrentOffense - homeCurrentOffenseAvg
  const homeDefenseDelta = homeCurrentDefense - homeCurrentDefenseAvg
  const awayOffenseDelta = awayCurrentOffense - awayCurrentOffenseAvg
  const awayDefenseDelta = awayCurrentDefense - awayCurrentDefenseAvg

  const homeMatchupDelta = homeOffenseDelta + awayDefenseDelta
  const awayMatchupDelta = awayOffenseDelta + homeDefenseDelta

  const homeMatchupGrade = getMatchupGrade(homeMatchupDelta)
  const awayMatchupGrade = getMatchupGrade(awayMatchupDelta)

  return (
    <div className="flex flex-col gap-2 px-4 mb-4">
      <div className="uppercase text-sm font-bold">{label}</div>
      <div className="flex gap-8 ">
        <div className={`flex`}>
          <span className={`flex justify-center px-4 py-2 rounded text-2xl font-bold w-16 ${awayMatchupGrade.bgClass}`}>
            {awayMatchupGrade.grade}
          </span>
        </div>
        <div className={`flex `}>
          <span
            className={`flex justify-center px-4 py-2 rounded text-2xl font-bold w-16  ${homeMatchupGrade.bgClass}`}
          >
            {homeMatchupGrade.grade}
          </span>
        </div>
      </div>
    </div>
  )
}
