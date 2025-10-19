import { ColumnDef } from '@tanstack/react-table'
import { Newspaper, Siren } from 'lucide-react'
import Image from 'next/image'

import {
  getColorByValue,
  mktShareConfig,
  pffGradeConfig,
  targetsConfig,
} from '@/shared/utils/colorCoding'
import { fmtUSD } from '@/shared/utils/fmtUSD'

import { Player } from '../types/player'

export const baseColumns: ColumnDef<Player>[] = [
  {
    id: 'displayName',
    header: 'PLAYER',
    meta: 'Player',
    cell: ({ row }) => {
      const name = row.original.first_name + ' ' + row.original.last_name
      const status = row.original.status
      const newsStatus = row.original.news_status
      const val = status === 'None' ? null : status
      const breakingNews =
        newsStatus === 'Breaking' ? (
          <Siren size={14} className="text-red-500" />
        ) : newsStatus === 'Recent' ? (
          <Newspaper size={14} className="text-blue-500" />
        ) : null
      return (
        <div className="flex items-center text-left">
          {name ?? '-'}{' '}
          {val && (
            <span className="ml-3 text-[10px] bg-destructive rounded-sm px-2 font-bold">{val}</span>
          )}
          {breakingNews && <span className="ml-3">{breakingNews}</span>}
        </div>
      )
    },
  },
  {
    id: 'news',
    header: 'NEWS',
    meta: 'News Sources',
    cell: ({ row }) => {
      const name = row.original.first_name + ' ' + row.original.last_name
      return (
        <div className="flex items-center text-left">
          <div className="ml-3">
            <a
              href={`https://www.google.com/search?q=${name}+pff`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/pff_250_250.png" alt="pff" width={14} height={14} />
            </a>
          </div>

          <div className="ml-3">
            <a
              href={`https://www.google.com/search?q=${name}+rotowire+espn+player+news`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src="/rw_250_250.png" alt="rw" width={14} height={14} />
            </a>
          </div>
        </div>
      )
    },
  },
  {
    id: 'salary',
    header: '$',
    meta: 'Salary',
    cell: ({ row }) => {
      const salary = row.original.salary ? Number(row.original.salary) : 0
      return <div>{fmtUSD.format(salary)}</div>
    },
  },
  {
    id: 'projection',
    header: 'PROJ',
    meta: 'Projected points',
    accessorFn: row => row.projection ?? '-',
  },
  {
    id: 'roi',
    header: 'ROI',
    meta: 'FPTS/Salary',
    cell: ({ row }) => {
      const salary = row.original.salary
      const projection = row.original.projection
      const val = salary && projection ? ((projection / salary) * 1000).toFixed(2) : '-'
      return <div>{val}</div>
    },
  },
]

export const quarterbackColumns: ColumnDef<Player>[] = [
  {
    id: 'player_game_count',
    header: 'GP',
    meta: 'Games played',
    cell: ({ row }) => {
      const player_game_count = row.original.passing?.player_game_count
      return <div>{player_game_count}</div>
    },
  },
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
    id: 'scrambles_g',
    header: 'SCR/G',
    meta: 'Scrambles per game',
    cell: ({ row }) => {
      const s = row.original.passing?.scrambles
      const g = row.original.passing?.player_game_count
      return <div>{s && g ? (s / g).toFixed(1) : '-'}</div>
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
    id: 'rush_share',
    header: 'RUSH%',
    meta: 'Rush share',
    cell: ({ row }) => {
      const mkt = row.original.rushing?.rushing_share
      const mktVal = mkt ? mkt : 0
      const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
      return (
        <div
          className={`flex items-center justify-center rounded w-9 ${getColorByValue(mktVal, mktShareConfig)}`}
        >
          {val}
        </div>
      )
    },
  },
  {
    id: 'td_g',
    header: 'TD/G',
    meta: 'Touchdowns per game',
    cell: ({ row }) => {
      const touchdowns = row.original.passing?.touchdowns
      const player_game_count = row.original.passing?.player_game_count
      const val =
        touchdowns && player_game_count ? (touchdowns / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'ypa',
    header: 'YPA',
    meta: 'Yards per attempt',
    cell: ({ row }) => {
      const ypa = row.original.passing?.ypa ? row.original.passing?.ypa : '-'
      return <div>{ypa}</div>
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
    id: 'avg_depth_of_target',
    header: 'ADOT',
    meta: 'Average depth of target',
    cell: ({ row }) => {
      const avg_depth_of_target = row.original.passing?.avg_depth_of_target
        ? row.original.passing?.avg_depth_of_target
        : '-'
      return <div>{avg_depth_of_target}</div>
    },
  },
  {
    id: 'big_time_throws',
    header: 'BTT',
    meta: 'Big time throws %',
    cell: ({ row }) => {
      const pass_att = row.original.passing?.attempts
      const btt = row.original.passing?.big_time_throws
      const val = pass_att && btt ? ((btt / pass_att) * 100).toFixed(1) + '%' : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'pass',
    header: 'PASS',
    meta: 'Passing grade',
    cell: ({ row }) => {
      const val = row.original.passing?.grades_pass ?? '-'
      return (
        <div
          className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
        >
          {val}
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
      return (
        <div
          className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
        >
          {val}
        </div>
      )
    },
  },
  {
    id: 'first_downs',
    header: '1D',
    meta: 'First Downs Per Game',
    cell: ({ row }) => {
      const first_downs = row.original.passing?.first_downs
      const player_game_count = row.original.passing?.player_game_count
      const val =
        first_downs && player_game_count ? (first_downs / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'interceptions',
    header: 'INT',
    meta: 'Interceptions Per Game',
    cell: ({ row }) => {
      const interceptions = row.original.passing?.interceptions
      const player_game_count = row.original.passing?.player_game_count
      const val =
        interceptions && player_game_count ? (interceptions / player_game_count).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'turnover_worthy_plays',
    header: 'TWP',
    meta: 'Turnover Worthy Plays %',
    cell: ({ row }) => {
      const turnover_worthy_plays = row.original.passing?.turnover_worthy_plays
      const pass_att = row.original.passing?.attempts
      const val =
        turnover_worthy_plays && pass_att ? (turnover_worthy_plays / pass_att).toFixed(1) : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'drop_rate',
    header: 'DR',
    meta: 'Drop Rate',
    cell: ({ row }) => {
      const drop_rate = row.original.passing?.drop_rate
      const val = drop_rate ? drop_rate : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'avg_time_to_throw',
    header: 'ATtT',
    meta: 'Average Time to Throw',
    cell: ({ row }) => {
      const avg_time_to_throw = row.original.passing?.avg_time_to_throw
      const val = avg_time_to_throw ? avg_time_to_throw : '-'
      return <div>{val}</div>
    },
  },
  {
    id: 'qb_rating',
    header: 'QBR',
    meta: 'QB Rating',
    cell: ({ row }) => {
      const qb_rating = row.original.passing?.qb_rating
      const val = qb_rating ? qb_rating : '-'
      return <div>{val}</div>
    },
  },
]

export const runningbackColumns: ColumnDef<Player>[] = [
  {
    id: 'player_game_count',
    header: 'GP',
    meta: 'Games played',
    cell: ({ row }) => {
      const player_game_count = row.original.rushing?.player_game_count
      return <div>{player_game_count}</div>
    },
  },
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
      const val =
        touchdowns && player_game_count ? (touchdowns / player_game_count).toFixed(1) : '-'
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
      const mktVal = mkt ? mkt : 0
      const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
      return (
        <div
          className={`flex items-center justify-center rounded w-9 ${getColorByValue(mktVal, mktShareConfig)}`}
        >
          {val}
        </div>
      )
    },
  },
  {
    id: 'tgt_g',
    header: 'TGT/G',
    meta: 'Targets per game',
    cell: ({ row }) => {
      const targets = row.original.receiving?.targets
      const player_game_count = row.original.receiving?.player_game_count
      const targetsPerGame = targets && player_game_count ? targets / player_game_count : 0
      const val = targets && player_game_count ? (targets / player_game_count).toFixed(1) : '-'
      return (
        <div
          className={`flex items-center justify-center rounded w-9 ${getColorByValue(targetsPerGame, targetsConfig)}`}
        >
          {val}
        </div>
      )
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
    id: 'rush',
    header: 'RUSH',
    meta: 'Rushing grade',
    cell: ({ row }) => {
      const val = row.original.rushing?.grades_run ?? '-'
      return (
        <div className="flex justify-center">
          <div
            className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
          >
            {val}
          </div>
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
      return (
        <div className="flex justify-center">
          <div
            className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
          >
            {val}
          </div>
        </div>
      )
    },
  },
]

export const widereceiverColumns: ColumnDef<Player>[] = [
  {
    id: 'player_game_count',
    header: 'GP',
    meta: 'Games played',
    cell: ({ row }) => {
      const player_game_count = row.original.receiving?.player_game_count
      return <div>{player_game_count}</div>
    },
  },
  {
    id: 'tgt_g',
    header: 'TGT/G',
    meta: 'Targets per game',
    cell: ({ row }) => {
      const targets = row.original.receiving?.targets
      const player_game_count = row.original.receiving?.player_game_count
      const targetsPerGame = targets && player_game_count ? targets / player_game_count : 0
      const val = targets && player_game_count ? (targets / player_game_count).toFixed(1) : '-'
      return (
        <div
          className={`flex items-center justify-center rounded w-9 ${getColorByValue(targetsPerGame, targetsConfig)}`}
        >
          {val}
        </div>
      )
    },
  },
  {
    id: 'target_share',
    header: 'TGT%',
    meta: 'Target share',
    cell: ({ row }) => {
      const mkt = row.original.receiving?.wr_target_share
      const mktVal = mkt ? mkt : 0
      const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
      return (
        <div
          className={`flex items-center justify-center rounded w-9 ${getColorByValue(mktVal, mktShareConfig)}`}
        >
          {val}
        </div>
      )
    },
  },
  {
    id: 'rec_g',
    header: 'REC/G',
    meta: 'Receptions per game',
    cell: ({ row }) => {
      const receptions = row.original.receiving?.receptions
      const player_game_count = row.original.receiving?.player_game_count
      const val =
        receptions && player_game_count ? (receptions / player_game_count).toFixed(1) : '-'
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
      const val =
        touchdowns && player_game_count ? (touchdowns / player_game_count).toFixed(1) : '-'
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
    id: 'hands',
    header: 'HANDS',
    meta: 'Hands grade',
    cell: ({ row }) => {
      const val = row.original.receiving?.grades_hands_drop ?? '-'
      return (
        <div className="flex justify-center">
          <div
            className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
          >
            {val}
          </div>
        </div>
      )
    },
  },
]
