import { ColumnDef } from '@tanstack/react-table'

import { Player } from '@/types/Player'
import { getColorByValue, mktShareConfig, pffGradeConfig } from '@/utils/color-coding'
import { getLetterGrade } from '@/utils/letter-grade'

export const baseColumns: ColumnDef<any>[] = [
  {
    id: 'displayName',
    header: 'PLAYER',
    meta: 'Player',
    cell: ({ row }) => {
      const name = row.original.first_name + ' ' + row.original.last_name
      return <div className="text-left">{name ?? '-'}</div>
    },
  },
  {
    id: 'salary',
    header: '$',
    meta: 'Salary',
    accessorFn: row => row.salary ?? '-',
  },
  {
    id: '_projection',
    header: 'PROJ',
    meta: 'Projected points',
    accessorFn: row => row._projection ?? '-',
  },
  {
    id: 'roi',
    header: 'ROI',
    meta: 'FPTS/Salary',
    cell: ({ row }) => {
      const salary = row.original.salary
      const projection = row.original._projection
      const val = salary && projection ? (projection / salary).toFixed(2) : '-'
      return <div>{val}</div>
    },
  },
]

export const quarterbackColumns: ColumnDef<Player>[] = [
  {
    id: 'dropbacks',
    header: 'DROP',
    meta: 'Dropbacks per game',
    cell: ({ row }) => {
      const dropbacks = row.original.passing?.dropbacks
      const player_game_count = row.original.passing?.player_game_count
      const val = dropbacks && player_game_count ? (dropbacks / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'att_g',
    header: 'ATT/G',
    meta: 'Attempts per game',
    cell: ({ row }) => {
      const attempts = row.original.passing?.attempts
      const player_game_count = row.original.passing?.player_game_count
      const val = attempts && player_game_count ? (attempts / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'comp_g',
    header: 'CMP/G',
    meta: 'Completions per game',
    cell: ({ row }) => {
      const completions = row.original.passing?.completions
      const player_game_count = row.original.passing?.player_game_count
      const val = completions && player_game_count ? (completions / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'td_g',
    header: 'TD/G',
    meta: 'Touchdowns per game',
    cell: ({ row }) => {
      const touchdowns = row.original.passing?.touchdowns
      const player_game_count = row.original.passing?.player_game_count
      const val = touchdowns && player_game_count ? (touchdowns / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'yds_g',
    header: 'YDS/G',
    meta: 'Yards per game',
    cell: ({ row }) => {
      const yards = row.original.passing?.yards
      const player_game_count = row.original.passing?.player_game_count
      const val = yards && player_game_count ? (yards / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'rsh_g',
    header: 'RSH/G',
    meta: 'Rush attempts per game',
    cell: ({ row }) => {
      const attempts = row.original.rushing?.attempts
      const player_game_count = row.original.rushing?.player_game_count
      const val = attempts && player_game_count ? (attempts / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'ryds_g',
    header: 'RYDS/G',
    meta: 'Rush yards per game',
    cell: ({ row }) => {
      const yards = row.original.rushing?.yards
      const player_game_count = row.original.rushing?.player_game_count
      const val = yards && player_game_count ? (yards / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'elusiveness',
    header: 'ELUS',
    meta: 'Elusiveness rating',
    cell: ({ row }) => {
      const val = row.original.rushing?.elusive_rating ?? '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'rush_share',
    header: 'RUSH%',
    meta: 'Rush share',
    cell: ({ row }) => {
      const mkt = row.original.rushing?.rushing_share
      const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(mkt, mktShareConfig)}`}>
          {val}
        </div>
      )
    },
  },
  {
    id: 'off',
    header: 'OFF',
    meta: 'Offense grade',
    cell: ({ row }) => {
      const val = row.original.passing?.grades_offense ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
  {
    id: 'pass',
    header: 'PASS',
    meta: 'Passing grade',
    cell: ({ row }) => {
      const val = row.original.passing?.grades_pass ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
  {
    id: 'rush',
    header: 'RUSH',
    meta: 'Rushing grade',
    cell: ({ row }) => {
      const val = row.original.rushing?.grades_run ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
  {
    id: 'hands',
    header: 'HANDS',
    meta: 'Hands grade',
    cell: ({ row }) => {
      const val = row.original.passing?.grades_hands_fumble ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
]

export const runningbackColumns: ColumnDef<Player>[] = [
  {
    id: 'att_g',
    header: 'ATT/G',
    meta: 'Rush attempts per game',
    cell: ({ row }) => {
      const attempts = row.original.rushing?.attempts
      const player_game_count = row.original.rushing?.player_game_count
      const val = attempts && player_game_count ? (attempts / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'yds_g',
    header: 'YDS/G',
    meta: 'Rush yards per game',
    cell: ({ row }) => {
      const yards = row.original.rushing?.yards
      const player_game_count = row.original.rushing?.player_game_count
      const val = yards && player_game_count ? (yards / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'yds_a',
    header: 'YDS/A',
    meta: 'Rush yards per attempt',
    cell: ({ row }) => {
      const yards = row.original.rushing?.yards
      const attempts = row.original.rushing?.attempts
      const val = yards && attempts ? (yards / attempts).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'td_g',
    header: 'TD/G',
    meta: 'Rush touchdowns per game',
    cell: ({ row }) => {
      const touchdowns = row.original.rushing?.touchdowns
      const player_game_count = row.original.rushing?.player_game_count
      const val = touchdowns && player_game_count ? (touchdowns / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'brk_pct',
    header: 'BRK%',
    meta: 'Breakaway percentage',
    cell: ({ row }) => {
      const val = row.original.rushing?.breakaway_percent ?? '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'elusiveness',
    header: 'ELUS',
    meta: 'Elusiveness rating',
    cell: ({ row }) => {
      const val = row.original.rushing?.elusive_rating ?? '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'rush_share',
    header: 'RUSH%',
    meta: 'Rush share',
    cell: ({ row }) => {
      const mkt = row.original.rushing?.rushing_share
      const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'tgt_g',
    header: 'TGT/G',
    meta: 'Targets per game',
    cell: ({ row }) => {
      const targets = row.original.receiving?.targets
      const player_game_count = row.original.receiving?.player_game_count
      const val = targets && player_game_count ? (targets / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'rcv_g',
    header: 'RCV/G',
    meta: 'Receptions per game',
    cell: ({ row }) => {
      const yards = row.original.receiving?.yards
      const player_game_count = row.original.receiving?.player_game_count
      const val = yards && player_game_count ? (yards / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'rte_r',
    header: 'RTE%',
    meta: 'Route rate',
    cell: ({ row }) => {
      const val = row.original.receiving?.route_rate ?? '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'tqb_r',
    header: 'TQB%',
    meta: 'Targeted QB rating',
    cell: ({ row }) => {
      const val = row.original.receiving?.targeted_qb_rating ?? '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'target_share',
    header: 'TGT%',
    meta: 'Target share',
    cell: ({ row }) => {
      const mkt = row.original.receiving?.rb_target_share
      const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'off',
    header: 'OFF',
    meta: 'Offense grade',
    cell: ({ row }) => {
      const val = row.original.rushing?.grades_offense ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
  {
    id: 'rush',
    header: 'RUSH',
    meta: 'Rushing grade',
    cell: ({ row }) => {
      const val = row.original.rushing?.grades_run ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
  {
    id: 'hands',
    header: 'HANDS',
    meta: 'Hands grade',
    cell: ({ row }) => {
      const val = row.original.receiving?.grades_hands_fumble ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
]

export const widereceiverColumns: ColumnDef<Player>[] = [
  {
    id: 'tgt_g',
    header: 'TGT/G',
    meta: 'Targets per game',
    cell: ({ row }) => {
      const targets = row.original.receiving?.targets
      const player_game_count = row.original.receiving?.player_game_count
      const val = targets && player_game_count ? (targets / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'rec_g',
    header: 'REC/G',
    meta: 'Receptions per game',
    cell: ({ row }) => {
      const receptions = row.original.receiving?.receptions
      const player_game_count = row.original.receiving?.player_game_count
      const val = receptions && player_game_count ? (receptions / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'recy_g',
    header: 'YDS/G',
    meta: 'Receiving yards per game',
    cell: ({ row }) => {
      const yards = row.original.receiving?.yards
      const player_game_count = row.original.receiving?.player_game_count
      const val = yards && player_game_count ? (yards / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'recy_a',
    header: 'YDS/A',
    meta: 'Receiving yards per reception',
    cell: ({ row }) => {
      const yards = row.original.receiving?.yards
      const receptions = row.original.receiving?.receptions
      const val = yards && receptions ? (yards / receptions).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'td_g',
    header: 'TD/G',
    meta: 'Receiving touchdowns per game',
    cell: ({ row }) => {
      const touchdowns = row.original.receiving?.touchdowns
      const player_game_count = row.original.receiving?.player_game_count
      const val = touchdowns && player_game_count ? (touchdowns / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'rte_r',
    header: 'RTE%',
    meta: 'Route rate',
    cell: ({ row }) => {
      const val = row.original.receiving?.route_rate ?? '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'tqb_r',
    header: 'TQB%',
    meta: 'Targeted QB rating',
    cell: ({ row }) => {
      const val = row.original.receiving?.targeted_qb_rating ?? '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'target_share',
    header: 'TGT%',
    meta: 'Target share',
    cell: ({ row }) => {
      const mkt = row.original.receiving?.wr_target_share
      const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'off',
    header: 'OFF',
    meta: 'Offense grade',
    cell: ({ row }) => {
      const val = row.original.receiving?.grades_offense ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
  {
    id: 'hands',
    header: 'HANDS',
    meta: 'Hands grade',
    cell: ({ row }) => {
      const val = row.original.receiving?.grades_hands_drop ?? '-'
      const letterGrade = getLetterGrade(val)
      return (
        <div className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}>
          {letterGrade}
        </div>
      )
    },
  },
]
