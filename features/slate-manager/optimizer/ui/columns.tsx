import { ColumnDef } from '@tanstack/react-table'
import { Lock, RefreshCcw } from 'lucide-react'

import { Player } from '@/features/slate-manager/_types/player'
import { getColorByValue, pffGradeConfig } from '@/shared/utils/colorCoding'
import { getLetterGrade } from '@/shared/utils/letterGrade'

import { ExcludeCell, LockCell, PlayerNameCell, PositionCell, ROICell } from './PlayerCell'

export function makePlayerColumns({
  onToggleExclude,
  onToggleLock,
  onToggleExcludePlayersSubset,
  isAllExcluded,
}: {
  onToggleExclude: (id: string, excluded: boolean) => void
  onToggleLock: (id: string, locked: boolean) => void
  onToggleExcludePlayersSubset: () => void
  isAllExcluded: boolean
}): ColumnDef<Player>[] {
  return [
    {
      header: 'Basic Info',
      meta: { group: 'core' },
      columns: [
        {
          id: 'exc',
          header: () => (
            <div className="flex justify-center w-8">
              <button
                type="button"
                onClick={() => onToggleExcludePlayersSubset()}
                title={isAllExcluded ? 'Include all' : 'Exclude all'}
              >
                <RefreshCcw className="w-4 h-4 hover:text-destructive" />
              </button>
            </div>
          ),
          meta: { group: 'core' },
          cell: ({ row }) => (
            <ExcludeCell player={row.original} onToggleExclude={onToggleExclude} />
          ),
        },
        {
          id: 'lock',
          header: () => <Lock className="w-4 h-4 text-muted" />,
          meta: { group: 'core' },
          cell: ({ row }) => <LockCell player={row.original} onToggleLock={onToggleLock} />,
        },
        {
          id: 'displayName',
          header: 'PLAYER',
          meta: { group: 'core' },
          cell: ({ row }) => <PlayerNameCell player={row.original} />,
        },
        {
          id: 'team',
          header: 'TM',
          meta: { group: 'core' },
          cell: ({ row }) => {
            return <div>{row.original.team_abbr}</div>
          },
        },
        {
          id: 'position',
          header: 'POS',
          meta: { group: 'core' },
          cell: ({ row }) => <PositionCell player={row.original} />,
        },
        {
          id: 'salary',
          header: '$',
          meta: { group: 'core' },
          accessorFn: row => row.salary ?? '-',
        },
        {
          id: 'projection',
          header: 'PROJ',
          meta: { group: 'core' },
          accessorFn: row => row.projection ?? '-',
        },
        {
          id: 'roi',
          header: 'ROI',
          meta: { group: 'core' },
          accessorFn: row => {
            const salary = Number(row.salary)
            const projection = Number(row.projection)
            if (!salary || isNaN(salary) || isNaN(projection)) return 0 // fallback for sorting
            return (projection / salary) * 1000
          },
          cell: ({ row }) => <ROICell player={row.original} />,
          sortingFn: 'basic',
        },
      ],
    },
    {
      header: 'Quarterback Stats',
      meta: { group: 'passing' },
      columns: [
        {
          id: 'dropbacks',
          header: 'DROP',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const dropbacks = row.original.passing?.dropbacks
            const player_game_count = row.original.passing?.player_game_count
            const val =
              dropbacks && player_game_count ? (dropbacks / player_game_count).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'scrambles_g',
          header: 'SCR/G',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const s = row.original.passing?.scrambles
            const g = row.original.passing?.player_game_count
            return <div>{s && g ? (s / g).toFixed(1) : '-'}</div>
          },
        },
        {
          id: 'rsh_g',
          header: 'RSH/G',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const attempts = row.original.rushing?.attempts
            const player_game_count = row.original.rushing?.player_game_count
            const val =
              attempts && player_game_count ? (attempts / player_game_count).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'qb_rush_share',
          header: 'RUSH%',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const mkt = row.original.rushing?.rushing_share
            const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
            return <div className={`flex items-center justify-center rounded w-9`}>{val}</div>
          },
        },
        {
          id: 'ptd_g',
          header: 'TD/G',
          meta: { group: 'passing' },
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
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const ypa = row.original.passing?.ypa ? row.original.passing?.ypa : '-'
            return <div>{ypa}</div>
          },
        },
        {
          id: 'pyds_g',
          header: 'YDS/G',
          meta: { group: 'passing' },
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
          meta: { group: 'passing' },
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
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const big_time_throws = row.original.passing?.big_time_throws
              ? row.original.passing?.big_time_throws
              : '-'
            return <div>{big_time_throws}</div>
          },
        },
        {
          id: 'pass',
          header: 'PASS',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const val = row.original.passing?.grades_pass ?? '-'
            const letterGrade = getLetterGrade(val)
            return (
              <div
                className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
              >
                {letterGrade}
              </div>
            )
          },
        },
        {
          id: 'qbrush',
          header: 'RUSH',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const val = row.original.rushing?.grades_run ?? '-'
            const letterGrade = getLetterGrade(val)
            return (
              <div
                className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
              >
                {letterGrade}
              </div>
            )
          },
        },
        {
          id: 'first_downs',
          header: '1D',
          meta: { group: 'passing' },
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
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const interceptions = row.original.passing?.interceptions
            const player_game_count = row.original.passing?.player_game_count
            const val =
              interceptions && player_game_count
                ? (interceptions / player_game_count).toFixed(1)
                : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'turnover_worthy_plays',
          header: 'TWP',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const turnover_worthy_plays = row.original.passing?.turnover_worthy_plays
            const player_game_count = row.original.passing?.player_game_count
            const val =
              turnover_worthy_plays && player_game_count
                ? (turnover_worthy_plays / player_game_count).toFixed(1)
                : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'drop_rate',
          header: 'DR',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const drop_rate = row.original.passing?.drop_rate
            const val = drop_rate ? drop_rate : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'avg_time_to_throw',
          header: 'ATtT',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const avg_time_to_throw = row.original.passing?.avg_time_to_throw
            const val = avg_time_to_throw ? avg_time_to_throw : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'qb_rating',
          header: 'QBR',
          meta: { group: 'passing' },
          cell: ({ row }) => {
            const qb_rating = row.original.passing?.qb_rating
            const val = qb_rating ? qb_rating : '-'
            return <div>{val}</div>
          },
        },
      ],
    },
    {
      header: 'Running Back Stats',
      meta: { group: 'rushing' },
      columns: [
        {
          id: 'ratt_g',
          header: 'ATT/G',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const attempts = row.original.rushing?.attempts
            const player_game_count = row.original.rushing?.player_game_count
            const val =
              attempts && player_game_count ? (attempts / player_game_count).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'ryds_g',
          header: 'YDS/G',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const yards = row.original.rushing?.yards
            const player_game_count = row.original.rushing?.player_game_count
            const val = yards && player_game_count ? (yards / player_game_count).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'ryds_a',
          header: 'YDS/A',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const yards = row.original.rushing?.yards
            const attempts = row.original.rushing?.attempts
            const val = yards && attempts ? (yards / attempts).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rtd_g',
          header: 'TD/G',
          meta: { group: 'rushing' },
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
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const val = row.original.rushing?.breakaway_percent ?? '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'elusiveness',
          header: 'ELUS',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const val = row.original.rushing?.elusive_rating ?? '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rush_share',
          header: 'RUSH%',
          meta: { group: 'rushing' },
          accessorFn: row => row.rushing?.rushing_share ?? 0,
          cell: ({ row }) => {
            const mkt = row.original.rushing?.rushing_share
            const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rtgt_g',
          header: 'TGT/G',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const targets = row.original.receiving?.targets
            const player_game_count = row.original.receiving?.player_game_count
            const val =
              targets && player_game_count ? (targets / player_game_count).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rcv_g',
          header: 'RCV/G',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const yards = row.original.receiving?.yards
            const player_game_count = row.original.receiving?.player_game_count
            const val = yards && player_game_count ? (yards / player_game_count).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rush_rte_r',
          header: 'RTE%',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const val = row.original.receiving?.route_rate ?? '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'tqb_r',
          header: 'TQB%',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const val = row.original.receiving?.targeted_qb_rating ?? '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rb_target_share',
          header: 'TGT%',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const mkt = row.original.receiving?.rb_target_share
            const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rush',
          header: 'RUSH',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const val = row.original.rushing?.grades_run ?? '-'
            const letterGrade = getLetterGrade(val)
            return (
              <div className="flex justify-center">
                <div
                  className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
                >
                  {letterGrade}
                </div>
              </div>
            )
          },
        },
        {
          id: 'hands',
          header: 'HANDS',
          meta: { group: 'rushing' },
          cell: ({ row }) => {
            const val = row.original.receiving?.grades_hands_fumble ?? '-'
            const letterGrade = getLetterGrade(val)
            return (
              <div className="flex justify-center">
                <div
                  className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
                >
                  {letterGrade}
                </div>
              </div>
            )
          },
        },
      ],
    },
    {
      header: 'Wide Receiver Stats',
      meta: { group: 'receiving' },
      columns: [
        {
          id: 'tgt_g',
          header: 'TGT/G',
          meta: { group: 'receiving' },
          accessorKey: 'tgt_g',
          cell: ({ row }) => {
            const targets = row.original.receiving?.targets
            const player_game_count = row.original.receiving?.player_game_count
            const val =
              targets && player_game_count ? (targets / player_game_count).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rec_g',
          header: 'REC/G',
          meta: { group: 'receiving' },
          accessorKey: 'rec_g',
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
          meta: { group: 'receiving' },
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
          meta: { group: 'receiving' },
          cell: ({ row }) => {
            const yards = row.original.receiving?.yards
            const receptions = row.original.receiving?.receptions
            const val = yards && receptions ? (yards / receptions).toFixed(1) : '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rectd_g',
          header: 'TD/G',
          meta: { group: 'receiving' },
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
          meta: { group: 'receiving' },
          cell: ({ row }) => {
            const val = row.original.receiving?.route_rate ?? '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'rtqb_r',
          header: 'TQB%',
          meta: { group: 'receiving' },
          cell: ({ row }) => {
            const val = row.original.receiving?.targeted_qb_rating ?? '-'
            return <div>{val}</div>
          },
        },
        {
          id: 'wr_target_share',
          header: 'TGT%',
          meta: { group: 'receiving' },
          accessorFn: row => row.receiving?.wr_target_share ?? 0,
          cell: ({ getValue }) => {
            const val = getValue<number>()
            return <div>{val ? (val * 100).toFixed() + '%' : '-'}</div>
          },
        },
        {
          id: 'rhands',
          header: 'HANDS',
          meta: { group: 'receiving' },
          cell: ({ row }) => {
            const val = row.original.receiving?.grades_hands_drop ?? '-'
            const letterGrade = getLetterGrade(val)
            return (
              <div className="flex justify-center">
                <div
                  className={`flex items-center justify-center rounded w-9 ${getColorByValue(val, pffGradeConfig)}`}
                >
                  {letterGrade}
                </div>
              </div>
            )
          },
        },
      ],
    },
  ]
}
