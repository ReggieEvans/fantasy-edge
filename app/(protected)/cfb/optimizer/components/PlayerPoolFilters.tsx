'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function PlayerPoolFilters() {
  const [position, setPosition] = useState<string>('all')
  return (
    <div className="flex gap-6 items-center">
      <div>
        <Select>
          <SelectTrigger className="w-32 border border-background-darker text-xs">
            <SelectValue placeholder="Select Sport" />
          </SelectTrigger>
          <SelectContent className="bg-background-darker">
            <SelectItem value="nfl">NFL</SelectItem>
            <SelectItem value="cfb">CFB</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select>
          <SelectTrigger className="w-56 border border-background-darker text-xs">
            <SelectValue placeholder="Select Slate" />
          </SelectTrigger>
          <SelectContent className="bg-background-darker">
            <SelectItem value="Slate 1">Slate 1</SelectItem>
            <SelectItem value="Slate 2">Slate 2</SelectItem>
            <SelectItem value="Slate 3">Slate 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <ToggleGroup variant="outline" type="single" value={position} onValueChange={setPosition}>
          <ToggleGroupItem value="all" aria-label="Toggle bold" className="text-xs">
            ALL
          </ToggleGroupItem>
          <ToggleGroupItem value="qb" aria-label="Toggle italic" className="text-xs">
            QB
          </ToggleGroupItem>
          <ToggleGroupItem value="rb" aria-label="Toggle strikethrough" className="text-xs">
            RB
          </ToggleGroupItem>
          <ToggleGroupItem value="wr" aria-label="Toggle strikethrough" className="text-xs">
            WR
          </ToggleGroupItem>
          <ToggleGroupItem value="te" aria-label="Toggle strikethrough" className="text-xs">
            TE
          </ToggleGroupItem>
          <ToggleGroupItem value="dst" aria-label="Toggle strikethrough" className="text-xs">
            DST
          </ToggleGroupItem>
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
          <Label className="text-xs px-1 text-muted">Player Pool</Label>
          <Badge variant="outline" className="bg-background-darker">
            0
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-xs px-1 text-muted">Targeted</Label>
          <Badge variant="outline" className="bg-background-darker">
            0
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-xs px-1 text-muted">Locks</Label>
          <Badge variant="outline" className="bg-background-darker">
            0
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-xs px-1 text-muted">Excluded</Label>
          <Badge variant="outline" className="bg-background-darker">
            0
          </Badge>
        </div>
      </div>
    </div>
  )
}
