import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Slate } from '@/features/slate-manager/_types/slate'
import { formatDateTime } from '@/shared/utils/formatDkTime'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

import { Position, setPosition } from '../model/optimizerFilters.slice'

export default function OptimizerFilters({
  slate,
  positionsArray,
  excludedCount,
  lockedCount,
}: {
  slate: Slate | undefined
  positionsArray: string[] | undefined
  excludedCount: number
  lockedCount: number
}) {
  const dispatch = useAppDispatch()
  const position = useAppSelector(s => s.optimizerFilters.position)

  const slateType =
    slate?.contest_type_id === 94 || slate?.contest_type_id === 21 ? 'Classic' : 'Showdown'

  return (
    <div className="flex gap-6 items-center py-2">
      <div className="text-sm rounded py-2 px-4 border border-card">
        <span className="text-muted">Sport:</span> {slate?.sport} {slateType}
      </div>
      <div className="text-sm rounded py-2 px-4 border border-card">
        <span className="text-muted">Slate:</span> {formatDateTime(slate?.min_start_time)}{' '}
        {slate?.startTimeSuffix}
      </div>
      <div>
        <ToggleGroup
          variant="outline"
          type="single"
          value={position}
          onValueChange={val =>
            dispatch(setPosition((val as Position) || 'all' || 'cpt' || 'flex'))
          }
        >
          <ToggleGroupItem value="all" aria-label="Toggle bold" className="text-xs rounded">
            ALL
          </ToggleGroupItem>
          {slateType === 'Showdown' && (
            <ToggleGroupItem value="CPT" aria-label="Toggle bold" className="text-xs rounded">
              CPT
            </ToggleGroupItem>
          )}
          {positionsArray?.map(position => (
            <ToggleGroupItem
              key={position}
              value={position}
              aria-label={`Toggle ${position}`}
              className="text-xs rounded"
            >
              {position}
            </ToggleGroupItem>
          ))}
          {slateType === 'Showdown' && (
            <ToggleGroupItem value="FLEX" aria-label="Toggle bold" className="text-xs rounded">
              FLEX
            </ToggleGroupItem>
          )}
        </ToggleGroup>
      </div>
      <div>
        <Button
          variant="outline"
          className="text-xs rounded disabled:opacity-80 disabled:cursor-not-allowed hover:cursor-not-allowed disabled:bg-gray-500/10 disabled:text-gray-500"
          disabled={true}
        >
          Lock Targets
        </Button>
      </div>
      <div>
        <Button
          variant="outline"
          className="text-xs disabled:opacity-80 rounded disabled:cursor-not-allowed hover:cursor-not-allowed disabled:bg-gray-500/10 disabled:text-gray-500"
          disabled={true}
        >
          Exclude Non-Targets
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Label className="text-xs px-1 text-muted">Locks</Label>
          <Badge
            variant="outline"
            className={` ${lockedCount > 0 ? 'bg-accent text-accent-foreground' : 'bg-background-darker rounded'}`}
          >
            {lockedCount}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-xs px-1 text-muted">Excluded</Label>
          <Badge
            variant="outline"
            className={` ${excludedCount > 0 ? 'bg-destructive' : 'bg-background-darker rounded'}`}
          >
            {excludedCount}
          </Badge>
        </div>
      </div>
    </div>
  )
}
