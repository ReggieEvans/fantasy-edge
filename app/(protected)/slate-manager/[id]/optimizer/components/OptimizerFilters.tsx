import { Slate } from '@/app/(protected)/slate-manager/_types/slate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { formatDateTime } from '@/utils/formatDkTime'

import { CFBPosition, NFLPosition, setPosition } from '../../../_state/optimizerFilters.slice'

export default function OptimizerFilters({
  slate,
  positionsArray,
  excludedCount,
}: {
  slate: Slate | undefined
  positionsArray: string[] | undefined
  excludedCount: number
}) {
  const dispatch = useAppDispatch()
  const position = useAppSelector(s => s.optimizerFilters.position)

  const slateType = slate?.contest_type_id === 94 ? 'Classic' : 'Showdown'

  return (
    <div className="flex gap-6 items-center py-2">
      <div className="text-sm rounded py-2 px-4 border border-card">
        <span className="text-muted">Sport:</span> {slate?.sport} {slateType}
      </div>
      <div className="text-sm rounded py-2 px-4 border border-card">
        <span className="text-muted">Slate:</span> {formatDateTime(slate?.min_start_time)} {slate?.startTimeSuffix}
      </div>
      <div>
        <ToggleGroup
          variant="outline"
          type="single"
          value={position}
          onValueChange={val => dispatch(setPosition((val as CFBPosition | NFLPosition) || 'all'))}
        >
          <ToggleGroupItem value="all" aria-label="Toggle bold" className="text-xs">
            ALL
          </ToggleGroupItem>
          {positionsArray?.map(position => (
            <ToggleGroupItem key={position} value={position} aria-label={`Toggle ${position}`} className="text-xs">
              {position}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="w-40">
            <Button variant="outline" className="text-xs">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-background-darker">
            <DropdownMenuCheckboxItem>Column1</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Column2</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Column3</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Label className="text-xs px-1 text-muted">Locks</Label>
          <Badge variant="outline" className="bg-background-darker">
            0
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-xs px-1 text-muted">Excluded</Label>
          <Badge variant="outline" className={` ${excludedCount > 0 ? 'bg-destructive' : 'bg-background-darker'}`}>
            {excludedCount}
          </Badge>
        </div>
      </div>
    </div>
  )
}
