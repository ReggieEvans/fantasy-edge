import { ArrowBigDown, ArrowBigUp, LucideProps } from 'lucide-react'
import { ComponentType } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/utils/cn'

import { TimePreset } from '../helpers/applyTimePreset'
import { Bucket } from '../types/bucket'
import { Mode } from '../types/mode'

const BUCKET_META: Record<Bucket, { label: string; icon: ComponentType<LucideProps> | null }> = {
  Cash: { label: 'Cash', icon: null },
  'Cash+': { label: 'Cash+', icon: null },
  'Sm SE': { label: 'SE', icon: ArrowBigDown },
  'Lg SE': { label: 'SE', icon: ArrowBigUp },
  'Sm 20 Max': { label: '20 Max', icon: ArrowBigDown },
  'Lg 20 Max': { label: '20 Max', icon: ArrowBigUp },
  WTA: { label: 'WTA', icon: null },
  Harris: { label: 'Harris', icon: null },
  Other: { label: 'Other', icon: null },
}

export default function ContestFilter({
  season,
  setSeason,
  seasons,
  timePreset,
  setTimePreset,
  modes,
  setModes,
  buckets,
  setBuckets,
  sports,
  setSports,
}: {
  season: string
  setSeason: (season: string) => void
  seasons: string[]
  timePreset: TimePreset
  setTimePreset: (timePreset: TimePreset) => void
  modes: Mode[]
  setModes: (modes: Mode[]) => void
  buckets: Bucket[]
  setBuckets: (buckets: Bucket[]) => void
  sports: ('NFL' | 'CFB')[]
  setSports: (sports: ('NFL' | 'CFB')[]) => void
}) {
  return (
    <Card className="rounded border border-muted-bg">
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="flex flex-col space-y-1 xl:col-span-1">
            <label className="text-xs ml-1">Season</label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-full bg-background-secondary border border-muted-bg rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary">
                {seasons.map((s: string) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1 xl:col-span-1">
            <label className="text-xs">Time</label>
            <Select value={timePreset} onValueChange={(v: TimePreset) => setTimePreset(v)}>
              <SelectTrigger className="w-full bg-background-secondary border border-muted-bg rounded">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary">
                <SelectItem value="season">This Season</SelectItem>
                <SelectItem value="last-3">Last 3 days</SelectItem>
                <SelectItem value="last-7">Last 7 days</SelectItem>
                <SelectItem value="last-30">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-[1px] xl:col-span-2 -mt-1">
            <label className="text-xs">Mode</label>
            <ToggleGroup type="multiple" value={modes} className="flex justify-start gap-2">
              {['Classic', 'Showdown'].map(m => (
                <ToggleGroupItem
                  key={m}
                  value={m as Mode}
                  onClick={() => {
                    const set = new Set(modes)
                    if (set.has(m as Mode)) {
                      set.delete(m as Mode)
                    } else {
                      set.add(m as Mode)
                    }
                    setModes(Array.from(set))
                  }}
                  className={cn(
                    'w-28 h-8 py-1 rounded hover:bg-background-darker hover:text-foreground',
                    modes.includes(m as Mode)
                      ? 'bg-accent'
                      : 'bg-background-secondary border border-accent opacity-30',
                  )}
                >
                  {m}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-[1px] xl:col-span-2 -mt-1">
            <label className="text-xs font-medium">Sports</label>
            <ToggleGroup type="multiple" value={sports} className="flex justify-start gap-2">
              {(['NFL', 'CFB'] as const).map(s => (
                <ToggleGroupItem
                  key={s}
                  value={s}
                  onClick={() => {
                    const set = new Set(sports)
                    if (set.has(s)) {
                      set.delete(s)
                    } else {
                      set.add(s)
                    }
                    const arr = Array.from(set)
                    setSports(arr.length ? arr : [s])
                  }}
                  className={cn(
                    'w-28 h-8 py-1 rounded hover:bg-background-darker hover:text-foreground',
                    sports.includes(s)
                      ? 'bg-accent'
                      : 'bg-background-secondary border border-accent opacity-30',
                  )}
                >
                  {s}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-[1px] xl:col-span-6 -mt-1">
            <label className="text-xs">Contest Type</label>
            <ToggleGroup type="multiple" value={buckets} className="flex justify-start gap-2">
              {(Object.keys(BUCKET_META) as Bucket[]).map(b => {
                const { label, icon: Icon } = BUCKET_META[b]
                return (
                  <ToggleGroupItem
                    key={b}
                    value={b}
                    onClick={() => {
                      const set = new Set(buckets)
                      if (set.has(b)) {
                        set.delete(b)
                      } else {
                        set.add(b)
                      }
                      setBuckets(Array.from(set))
                    }}
                    className={cn(
                      'flex items-center gap-1 px-4 h-8 py-1 rounded hover:bg-background-darker hover:text-foreground',
                      buckets.includes(b)
                        ? 'bg-accent'
                        : 'bg-background-secondary border border-accent opacity-30',
                    )}
                  >
                    {Icon && <Icon className="mb-[1px]" />}
                    <span>{label}</span>
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
