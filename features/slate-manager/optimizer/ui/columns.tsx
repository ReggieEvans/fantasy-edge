import { ColumnDef, SortingFn } from '@tanstack/react-table'
import { Lock, RefreshCcw } from 'lucide-react'

import { Player } from '@/features/slate-manager/_types/player'
import { basicConfig, getColorByValue, pffGradeConfig } from '@/shared/utils/colorCoding'
import { cn } from '@/utils/cn'

import { ExcludeCell, LockCell, PlayerNameCell, PositionCell, ROICell } from './PlayerCell'

type Num = number | null

const percentSort: SortingFn<Player> = (a, b, id) => {
  const av = a.getValue<Num>(id)
  const bv = b.getValue<Num>(id)
  const an = typeof av === 'number' ? av : -Infinity
  const bn = typeof bv === 'number' ? bv : -Infinity
  return an === bn ? 0 : an < bn ? -1 : 1
}

const numSort: SortingFn<Player> = (a, b, id) => {
  const av = a.getValue<Num>(id)
  const bv = b.getValue<Num>(id)
  const an = typeof av === 'number' ? av : -Infinity
  const bn = typeof bv === 'number' ? bv : -Infinity
  return an === bn ? 0 : an < bn ? -1 : 1
}

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
          meta: { group: 'core', tooltip: 'Exclude' },
          cell: ({ row }) => (
            <ExcludeCell player={row.original} onToggleExclude={onToggleExclude} />
          ),
        },
        {
          id: 'lock',
          header: () => <Lock className="w-4 h-4 text-muted" />,
          meta: { group: 'core', tooltip: 'Lock' },
          enableSorting: false,
          cell: ({ row }) => <LockCell player={row.original} onToggleLock={onToggleLock} />,
        },
        {
          id: 'displayName',
          header: 'PLAYER',
          meta: { group: 'core', tooltip: 'Player' },
          sortingFn: 'basic',
          enableSorting: true,
          accessorFn: row => row.full_name,
          cell: ({ row }) => <PlayerNameCell player={row.original} />,
        },
        {
          id: 'team',
          header: 'TM',
          meta: { group: 'core', tooltip: 'Team' },
          sortingFn: 'basic',
          enableSorting: true,
          accessorFn: row => row.team_abbr,
          cell: ({ row }) => {
            return <div>{row.original.team_abbr}</div>
          },
        },
        {
          id: 'position',
          header: 'POS',
          meta: { group: 'core', tooltip: 'Position' },
          sortingFn: 'basic',
          enableSorting: true,
          accessorFn: row => row.position,
          cell: ({ row }) => <PositionCell player={row.original} />,
        },
        {
          id: 'salary',
          header: '$',
          meta: { group: 'core', tooltip: 'Salary' },
          accessorFn: row => row.salary ?? '-',
          sortingFn: 'basic',
          enableSorting: true,
        },
        {
          id: 'projection',
          header: 'PROJ',
          meta: { group: 'core', tooltip: 'Projection' },
          accessorFn: row => row.projection ?? '-',
          sortingFn: 'basic',
          enableSorting: true,
        },
        {
          id: 'roi',
          header: 'ROI',
          meta: { group: 'core', tooltip: 'Points per Dollar' },
          accessorFn: row => {
            const salary = Number(row.salary)
            const projection = Number(row.projection)
            if (!salary || isNaN(salary) || isNaN(projection)) return 0
            return (projection / salary) * 1000
          },
          cell: ({ row }) => <ROICell player={row.original} />,
          sortingFn: 'basic',
          enableSorting: true,
        },
        {
          id: 'game_total',
          header: 'TTL',
          accessorFn: row => row.game_total,
          meta: { group: 'core', tooltip: 'Total Points' },
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <span
                className={cn(
                  `flex items-center justify-center rounded w-9`,
                  getColorByValue(v ?? '-', basicConfig, {
                    thresholds: [48, 45, 42, 39],
                  }),
                )}
              >
                {v == null ? '—' : Math.round(v)}
              </span>
            )
          },
          sortingFn: 'basic',
          enableSorting: true,
        },
        {
          id: 'team_total',
          header: 'TM TTL',
          accessorFn: row => row.team_total,
          meta: { group: 'core', tooltip: 'Team Total Points' },
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <span
                className={cn(
                  `flex items-center justify-center rounded w-9`,
                  getColorByValue(v ?? '-', basicConfig, { thresholds: [25, 20, 15, 11] }),
                )}
              >
                {v == null ? '—' : Math.round(v)}
              </span>
            )
          },
          sortingFn: 'basic',
          enableSorting: true,
        },
      ],
    },
    {
      header: 'Passing Stats',
      meta: { group: 'passing' },
      columns: [
        {
          id: 'dropbacks',
          header: 'DROP',
          meta: { group: 'passing', tooltip: 'Dropbacks' },
          accessorFn: row => {
            const dropbacks = row.passing?.dropbacks
            const games = row.passing?.player_game_count
            if (typeof dropbacks !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return dropbacks / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'scrambles_g',
          header: 'SCR/G',
          meta: { group: 'passing', tooltip: 'Scrambles per Game' },
          accessorFn: row => {
            const scrambles = row.passing?.scrambles
            const games = row.passing?.player_game_count
            if (typeof scrambles !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return scrambles / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'rsh_g',
          header: 'RSH/G',
          meta: { group: 'passing', tooltip: 'Rushes per Game' },
          accessorFn: row => {
            const att = row.rushing?.attempts
            const games = row.rushing?.player_game_count
            if (typeof att !== 'number' || typeof games !== 'number' || games <= 0) return null
            return att / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'qb_rush_share',
          header: 'RUSH%',
          meta: { group: 'passing', tooltip: 'Rush Share' },
          accessorFn: row =>
            typeof row.rushing?.rushing_share === 'number' ? row.rushing.rushing_share * 100 : null,
          sortingFn: percentSort,
          enableSorting: true,
          cell: ({ row }) => {
            const mkt = row.original.rushing?.rushing_share
            const val = mkt ? (mkt * 100).toFixed() + '%' : '-'
            return <div className={`flex items-center justify-center rounded w-9`}>{val}</div>
          },
        },
        {
          id: 'ptd_g',
          header: 'TD/G',
          meta: { group: 'passing', tooltip: 'Touchdowns per Game' },
          accessorFn: row => {
            const touchdowns = row.passing?.touchdowns
            const games = row.passing?.player_game_count
            if (typeof touchdowns !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return touchdowns / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'ypa',
          header: 'YPA',
          meta: { group: 'passing', tooltip: 'Yards per Attempt' },
          accessorFn: row => {
            const ypa = row.passing?.ypa
            const games = row.passing?.player_game_count
            if (typeof ypa !== 'number' || typeof games !== 'number' || games <= 0) return null
            return ypa / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'pyds_g',
          header: 'YDS/G',
          meta: { group: 'passing', tooltip: 'Passing Yards per Game' },
          accessorFn: row => {
            const yards = row.passing?.yards
            const games = row.passing?.player_game_count
            if (typeof yards !== 'number' || typeof games !== 'number' || games <= 0) return null
            return yards / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'avg_depth_of_target',
          header: 'ADOT',
          meta: { group: 'passing', tooltip: 'Average Depth of Target' },
          accessorFn: row => {
            const avg_depth_of_target = row.passing?.avg_depth_of_target
            const games = row.passing?.player_game_count
            if (typeof avg_depth_of_target !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return avg_depth_of_target / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'big_time_throws',
          header: 'BTT',
          meta: { group: 'passing', tooltip: 'Big Time Throws' },
          accessorFn: row => {
            const big_time_throws = row.passing?.big_time_throws
            const games = row.passing?.player_game_count
            if (typeof big_time_throws !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return big_time_throws / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'pass',
          header: 'PASS',
          meta: { group: 'passing', tooltip: 'Passing Grade' },
          accessorFn: row => {
            const grades_pass = row.passing?.grades_pass
            if (typeof grades_pass !== 'number') return null
            return grades_pass
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={`flex items-center justify-center rounded w-9  ${getColorByValue(v ?? '-', pffGradeConfig)}`}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'qbrush',
          header: 'RUSH',
          meta: { group: 'passing', tooltip: 'Rushing Grade' },
          accessorFn: row => {
            const grades_run = row.rushing?.grades_run
            if (typeof grades_run !== 'number') return null
            return grades_run
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={`flex items-center justify-center rounded w-9  ${getColorByValue(v ?? '-', pffGradeConfig)}`}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'first_downs',
          header: '1D',
          meta: { group: 'passing', tooltip: 'First Downs per Game' },
          accessorFn: row => {
            const first_downs = row.passing?.first_downs
            const games = row.passing?.player_game_count
            if (typeof first_downs !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return first_downs / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'interceptions',
          header: 'INT',
          meta: { group: 'passing', tooltip: 'Interceptions per Game' },
          accessorFn: row => {
            const interceptions = row.passing?.interceptions
            const games = row.passing?.player_game_count
            if (typeof interceptions !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return interceptions / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'turnover_worthy_plays',
          header: 'TWP',
          meta: { group: 'passing', tooltip: 'Turnover Worthy Plays per Game' },
          accessorFn: row => {
            const turnover_worthy_plays = row.passing?.turnover_worthy_plays
            const games = row.passing?.player_game_count
            if (
              typeof turnover_worthy_plays !== 'number' ||
              typeof games !== 'number' ||
              games <= 0
            )
              return null
            return turnover_worthy_plays / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'drop_rate',
          header: 'DR',
          meta: { group: 'passing', tooltip: 'Drop Rate' },
          accessorFn: row => {
            const drop_rate = row.passing?.drop_rate
            if (typeof drop_rate !== 'number') return null
            return drop_rate
          },
          sortingFn: percentSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'avg_time_to_throw',
          header: 'ATtT',
          meta: { group: 'passing', tooltip: 'Average Time to Throw' },
          accessorFn: row => {
            const avg_time_to_throw = row.passing?.avg_time_to_throw
            if (typeof avg_time_to_throw !== 'number') return null
            return avg_time_to_throw
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'qb_rating',
          header: 'QBR',
          meta: { group: 'passing', tooltip: 'Quarterback Rating' },
          accessorFn: row => {
            const qb_rating = row.passing?.qb_rating
            if (typeof qb_rating !== 'number') return null
            return qb_rating
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
      ],
    },
    {
      header: 'Rushing Stats',
      meta: { group: 'rushing' },
      columns: [
        {
          id: 'ratt_g',
          header: 'ATT/G',
          meta: { group: 'rushing' },
          accessorFn: row => {
            const attempts = row.rushing?.attempts
            const games = row.rushing?.player_game_count
            if (typeof attempts !== 'number' || typeof games !== 'number' || games <= 0) return null
            return attempts / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'ryds_g',
          header: 'YDS/G',
          meta: { group: 'rushing', tooltip: 'Rushing Yards per Game' },
          accessorFn: row => {
            const yards = row.rushing?.yards
            const games = row.rushing?.player_game_count
            if (typeof yards !== 'number' || typeof games !== 'number' || games <= 0) return null
            return yards / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'ryds_a',
          header: 'YDS/A',
          meta: { group: 'rushing', tooltip: 'Rushing Yards per Attempt' },
          accessorFn: row => {
            const yards = row.rushing?.yards
            const attempts = row.rushing?.attempts
            if (typeof yards !== 'number' || typeof attempts !== 'number' || attempts <= 0)
              return null
            return yards / attempts
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'rtd_g',
          header: 'TD/G',
          meta: { group: 'rushing', tooltip: 'Touchdowns per Game' },
          accessorFn: row => {
            const touchdowns = row.rushing?.touchdowns
            const games = row.rushing?.player_game_count
            if (typeof touchdowns !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return touchdowns / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'brk_pct',
          header: 'BRK%',
          meta: { group: 'rushing', tooltip: 'Breakaway Percentage' },
          accessorFn: row => {
            const breakaway_percent = row.rushing?.breakaway_percent
            if (typeof breakaway_percent !== 'number') return null
            return breakaway_percent
          },
          sortingFn: percentSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'elusiveness',
          header: 'ELUS',
          meta: { group: 'rushing', tooltip: 'Elusiveness Rating' },
          accessorFn: row => {
            const elusive_rating = row.rushing?.elusive_rating
            if (typeof elusive_rating !== 'number') return null
            return elusive_rating
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'rush_share',
          header: 'RUSH%',
          meta: { group: 'rushing', tooltip: 'Rush Share' },
          accessorFn: row => {
            const rushing_share = row.rushing?.rushing_share
            if (typeof rushing_share !== 'number') return null
            return rushing_share
          },
          sortingFn: percentSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={cn(
                  'flex items-center justify-center rounded w-9',
                  getColorByValue(v == null ? '-' : v * 100, basicConfig, {
                    thresholds: [65, 50, 40, 30],
                  }),
                )}
              >
                {v == null ? '—' : (v * 100).toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'rtgt_g',
          header: 'TGT/G',
          meta: { group: 'rushing', tooltip: 'Targets per Game' },
          accessorFn: row => {
            const targets = row.receiving?.targets
            const games = row.receiving?.player_game_count
            if (typeof targets !== 'number' || typeof games !== 'number' || games <= 0) return null
            return targets / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={cn(
                  'flex items-center justify-center rounded w-9',
                  getColorByValue(v == null ? '-' : v, basicConfig, {
                    thresholds: [8, 6, 4, 2],
                  }),
                )}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'rcv_g',
          header: 'RCV/G',
          meta: { group: 'rushing', tooltip: 'Receptions per Game' },
          accessorFn: row => {
            const yards = row.receiving?.yards
            const games = row.receiving?.player_game_count
            if (typeof yards !== 'number' || typeof games !== 'number' || games <= 0) return null
            return yards / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'rush_rte_r',
          header: 'RTE%',
          meta: { group: 'rushing', tooltip: 'Route Rate' },
          accessorFn: row => {
            const route_rate = row.receiving?.route_rate
            if (typeof route_rate !== 'number') return null
            return route_rate
          },
          sortingFn: percentSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={cn(
                  'flex items-center justify-center rounded w-9',
                  getColorByValue(v == null ? '-' : v, basicConfig, {
                    thresholds: [90, 80, 70, 60],
                  }),
                )}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'tqb_r',
          header: 'TQB%',
          meta: { group: 'rushing', tooltip: 'Targeted QB Rating' },
          accessorFn: row => {
            const targeted_qb_rating = row.receiving?.targeted_qb_rating
            if (typeof targeted_qb_rating !== 'number') return null
            return targeted_qb_rating
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'rb_target_share',
          header: 'TGT%',
          meta: { group: 'rushing', tooltip: 'Target Share' },
          accessorFn: row => {
            const rb_target_share = row.receiving?.rb_target_share
            if (typeof rb_target_share !== 'number') return null
            return rb_target_share
          },
          sortingFn: percentSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={cn(
                  'flex items-center justify-center rounded w-9',
                  getColorByValue(v == null ? '-' : v * 100, basicConfig, {
                    thresholds: [20, 15, 10, 5],
                  }),
                )}
              >
                {v == null ? '—' : (v * 100).toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'rush',
          header: 'RUSH',
          meta: { group: 'rushing', tooltip: 'Rushing Grade' },
          accessorFn: row => {
            const grades_run = row.rushing?.grades_run
            if (typeof grades_run !== 'number') return null
            return grades_run
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={`flex items-center justify-center rounded w-9 ${getColorByValue(v ?? '-', pffGradeConfig)}`}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'hands',
          header: 'HANDS',
          meta: { group: 'rushing', tooltip: 'Hands Grade' },
          accessorFn: row => {
            const grades_hands_fumble = row.receiving?.grades_hands_fumble
            if (typeof grades_hands_fumble !== 'number') return null
            return grades_hands_fumble
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={`flex items-center justify-center rounded w-9 ${getColorByValue(v ?? '-', pffGradeConfig)}`}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
      ],
    },
    {
      header: 'Receiving Stats',
      meta: { group: 'receiving' },
      columns: [
        {
          id: 'tgt_g',
          header: 'TGT/G',
          meta: { group: 'receiving', tooltip: 'Targets per Game' },
          accessorKey: 'tgt_g',
          accessorFn: row => {
            const targets = row.receiving?.targets
            const games = row.receiving?.player_game_count
            if (typeof targets !== 'number' || typeof games !== 'number' || games <= 0) return null
            return targets / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={cn(
                  'flex items-center justify-center rounded w-9',
                  getColorByValue(v == null ? '-' : v, basicConfig, {
                    thresholds: [8, 6, 4, 2],
                  }),
                )}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'rec_g',
          header: 'REC/G',
          meta: { group: 'receiving', tooltip: 'Receptions per Game' },
          accessorKey: 'rec_g',
          accessorFn: row => {
            const receptions = row.receiving?.receptions
            const games = row.receiving?.player_game_count
            if (typeof receptions !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return receptions / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'recy_g',
          header: 'YDS/G',
          meta: { group: 'receiving', tooltip: 'Receiving Yards per Game' },
          accessorFn: row => {
            const yards = row.receiving?.yards
            const games = row.receiving?.player_game_count
            if (typeof yards !== 'number' || typeof games !== 'number' || games <= 0) return null
            return yards / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'recy_a',
          header: 'YDS/A',
          meta: { group: 'receiving', tooltip: 'Receiving Yards per Reception' },
          accessorFn: row => {
            const yards = row.receiving?.yards
            const receptions = row.receiving?.receptions
            if (typeof yards !== 'number' || typeof receptions !== 'number' || receptions <= 0)
              return null
            return yards / receptions
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'rectd_g',
          header: 'TD/G',
          meta: { group: 'receiving', tooltip: 'Touchdowns per Game' },
          accessorFn: row => {
            const touchdowns = row.receiving?.touchdowns
            const games = row.receiving?.player_game_count
            if (typeof touchdowns !== 'number' || typeof games !== 'number' || games <= 0)
              return null
            return touchdowns / games
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'rte_r',
          header: 'RTE%',
          meta: { group: 'receiving', tooltip: 'Route Rate' },
          accessorFn: row => {
            const route_rate = row.receiving?.route_rate
            if (typeof route_rate !== 'number') return null
            return route_rate
          },
          sortingFn: percentSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={cn(
                  'flex items-center justify-center rounded w-9',
                  getColorByValue(v == null ? '-' : v, basicConfig, {
                    thresholds: [99, 95, 90, 85],
                  }),
                )}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'rtqb_r',
          header: 'TQB%',
          meta: { group: 'receiving', tooltip: 'Targeted QB Rating' },
          accessorFn: row => {
            const targeted_qb_rating = row.receiving?.targeted_qb_rating
            if (typeof targeted_qb_rating !== 'number') return null
            return targeted_qb_rating
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return <div>{v == null ? '—' : v.toFixed(1)}</div>
          },
        },
        {
          id: 'wr_target_share',
          header: 'TGT%',
          meta: { group: 'receiving', tooltip: 'Target Share' },
          accessorFn: row => {
            const wr_target_share = row.receiving?.wr_target_share
            if (typeof wr_target_share !== 'number') return null
            return wr_target_share
          },
          sortingFn: percentSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={cn(
                  'flex items-center justify-center rounded w-9',
                  getColorByValue(v == null ? '-' : v * 100, basicConfig, {
                    thresholds: [30, 25, 20, 15],
                  }),
                )}
              >
                {v == null ? '—' : (v * 100).toFixed(1)}
              </div>
            )
          },
        },
        {
          id: 'rhands',
          header: 'HANDS',
          meta: { group: 'receiving', tooltip: 'Hands Grade' },
          accessorFn: row => {
            const grades_hands_drop = row.receiving?.grades_hands_drop
            if (typeof grades_hands_drop !== 'number') return null
            return grades_hands_drop
          },
          sortingFn: numSort,
          sortUndefined: 'last',
          enableSorting: true,
          cell: ({ getValue }) => {
            const v = getValue<number | null>()
            return (
              <div
                className={`flex items-center justify-center rounded w-9 ${getColorByValue(v ?? '-', pffGradeConfig)}`}
              >
                {v == null ? '—' : v.toFixed(1)}
              </div>
            )
          },
        },
      ],
    },
  ]
}
