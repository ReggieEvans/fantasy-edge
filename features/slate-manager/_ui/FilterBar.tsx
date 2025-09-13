import { Plus } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GameType } from '@/types/gameType'
import { Sport } from '@/types/sport'

export default function FiltersBar({
  sport,
  setSport,
  gameType,
  setGameType,
  onAddClick,
}: {
  sport: Sport
  setSport: (s: Sport) => void
  gameType: GameType
  setGameType: (g: GameType) => void
  onAddClick: () => void
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="w-[180px]">
          <Select value={sport} onValueChange={v => setSport(v as Sport)}>
            <SelectTrigger className="w-[180px] text-foreground">
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent className="bg-background-secondary">
              <SelectItem value="NFL">NFL</SelectItem>
              <SelectItem value="CFB">CFB</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select value={gameType} onValueChange={v => setGameType(v as GameType)}>
            <SelectTrigger className="w-[180px] text-foreground">
              <SelectValue placeholder="Select Game Type" />
            </SelectTrigger>
            <SelectContent className="bg-background-secondary">
              <SelectItem value="classic">Classic</SelectItem>
              <SelectItem value="showdown">Showdown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-[180px]">
        <button
          className="btn-accent flex w-full items-center justify-center gap-2 rounded-full"
          onClick={onAddClick}
        >
          <Plus size={20} /> Add Slate
        </button>
      </div>
    </div>
  )
}
