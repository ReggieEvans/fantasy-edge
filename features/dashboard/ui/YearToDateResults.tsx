import { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sport } from '@/types/sport'

export default function YearToDateResults() {
  const [sport, setSport] = useState<Sport>('NFL')
  return (
    <div className=" bg-background-secondary rounded border border-muted-bg h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-accent">
        <h2 className="text-lg font-bold text-foreground ">Year to Date Results</h2>
        <div className="w-[100px]">
          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger className="bg-background-secondary">
              <SelectValue placeholder="Select Sport" />
            </SelectTrigger>
            <SelectContent className="bg-background-secondary">
              <SelectItem value="NFL">NFL</SelectItem>
              <SelectItem value="CFB">CFB</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
