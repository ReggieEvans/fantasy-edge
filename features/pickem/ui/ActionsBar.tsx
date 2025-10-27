import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Aggression } from '../types/pickem'

interface ActionsBarProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleGenerate: () => void
  isLoading: boolean
  aggression: Aggression
  setAggression: (aggression: Aggression) => void
  canGenerate: boolean
}

export default function ActionsBar({
  handleFileUpload,
  handleGenerate,
  isLoading,
  aggression,
  setAggression,
  canGenerate,
}: ActionsBarProps) {
  return (
    <div className="flex gap-4 justify-between items-center">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label className="text-xs text-muted px-2" htmlFor="picks">
          Upload JSON File
        </Label>
        <Input id="picks" type="file" accept="application/json" onChange={handleFileUpload} />
      </div>
      <div className="flex items-end gap-4">
        <div className="flex flex-col items-start gap-2">
          <Label className="text-xs text-muted px-2" htmlFor="aggression">
            Aggression
          </Label>
          <Select value={aggression} onValueChange={v => setAggression(v as Aggression)}>
            <SelectTrigger className="w-56 border border-background-darker">
              <SelectValue placeholder="Balanced" />
            </SelectTrigger>
            <SelectContent className="bg-background-darker">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Balanced">Balanced</SelectItem>
              <SelectItem value="Aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={handleGenerate}
          className="btn-accent disabled:opacity-50"
          disabled={isLoading || !canGenerate}
        >
          {isLoading ? 'Generating...' : 'Generate Picks'}
        </button>
      </div>
    </div>
  )
}
