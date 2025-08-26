'use client'

import { ArrowRightCircle, CheckCircle, CloudUpload, MoreVertical, Trash2, XCircle } from 'lucide-react'
import Link from 'next/link'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { Slate as SlateType } from '../_types/slate'

interface SlateProps {
  slate: SlateType
  onDeleteSlate: (slate: SlateType) => void
}

const formatDateTime = (dateString: string) => {
  // Parse as UTC if no Z
  let date: Date
  if (dateString.endsWith('Z')) {
    date = new Date(dateString)
  } else {
    const [datePart, timePart] = dateString.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = (timePart || '00:00').split(':').map(Number)
    date = new Date(Date.UTC(year, month - 1, day, hour, minute))
  }

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: userTimeZone }).format(date)
  const md = new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', timeZone: userTimeZone }).format(date)
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit', // no seconds
    hour12: true,
    timeZone: userTimeZone,
  }).format(date)

  return `${day}, ${md}, ${time}`
}

export default function Slate({ slate, onDeleteSlate }: SlateProps) {
  const now = Date.now()
  const startTs = new Date(slate.min_start_time).getTime()
  const isFuture = startTs > now
  const statusColor = isFuture ? 'bg-green-500' : 'bg-muted-foreground'

  return (
    <div className="flex flex-col md:flex-row bg-card rounded-md">
      <div className={`hidden md:block w-3 h-3 rounded-full mt-8 ml-4 mr-2 ${statusColor}`} />

      <div className="flex-grow flex flex-col p-4">
        <div className="flex justify-between border-b py-2 uppercase">
          <h4 className="text-foreground font-black text-2xl">
            <span className="truncate">
              {formatDateTime(slate.min_start_time)} {slate.startTimeSuffix}
            </span>
            <span className="sr-only">{isFuture ? 'Upcoming' : 'Completed'}</span>
          </h4>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-4 text-sm">
            <button className="flex items-center text-primary">
              <CloudUpload size={16} className="mr-2" /> Upload Projections
            </button>
            <button onClick={() => onDeleteSlate(slate)} className="flex items-center text-destructive">
              <Trash2 size={16} className="mr-2" /> Delete
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2">
                  <MoreVertical size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <CloudUpload size={16} className="mr-2" /> Upload Projections
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDeleteSlate(slate)} className="text-destructive">
                  <Trash2 size={16} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-10 pt-4 text-xs uppercase">
          <Count label="Games" value={slate.gameCount} />
          <Count label="Targeted Players" value={slate.targetCount} />
          <div>
            <div className="text-muted text-xs uppercase text-center font-bold">Projections</div>
            <div className="mt-2 flex justify-center">
              {slate.hasProjections ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-destructive" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Manage Button */}
        <div className="md:hidden mt-4">
          <Link href={`slate-manager/${slate.id}`}>
            <button className="btn-accent flex justify-center items-center gap-2 w-full">
              <span className="mr-2 py-1 px-2 text-primary">Manage Slate</span>
              <ArrowRightCircle size={16} />
            </button>
          </Link>
        </div>
      </div>

      {/* Desktop Manage Section */}
      <div className="hidden md:flex flex-col justify-around w-[250px] px-6 border-l border-border">
        <Link href={`slate-manager/${slate.id}`}>
          <button className="btn-accent flex items-center gap-2">
            <span className="mr-2 py-1 px-2 text-primary">Manage Slate</span>
            <ArrowRightCircle size={16} />
          </button>
        </Link>
        <div>
          <div className="text-muted text-sm font-bold">Last Updated</div>
          <div className="text-sm">{formatDateTime(slate.min_start_time)}</div>
        </div>
      </div>

      {/* Mobile Last Updated */}
      <div className="md:hidden px-4 pb-4 text-xs">
        <div className="text-muted font-bold">Last Updated</div>
        <div>{formatDateTime(slate.min_start_time)}</div>
      </div>
    </div>
  )
}

function Count({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-muted text-xs uppercase text-center font-bold">{label}</div>
      <div className="font-bold text-primary text-center text-lg">{value}</div>
    </div>
  )
}
