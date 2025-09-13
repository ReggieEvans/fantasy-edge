'use client'

import {
  ArrowRightCircle,
  CheckCircle,
  CloudUpload,
  MoreVertical,
  Trash2,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateTime } from '@/shared/utils'

import { Slate as SlateType } from '../_types/slate'

interface SlateProps {
  slate: SlateType
  onDeleteSlate: (s: SlateType) => void
  onAddProjections: (s: SlateType) => void
}

export default function Slate({ slate, onDeleteSlate, onAddProjections }: SlateProps) {
  const { startLabel, isFuture, statusColor, startISO } = useMemo(() => {
    const startTs = new Date(slate.min_start_time).getTime()
    const now = Date.now()
    const isFuture = startTs > now
    return {
      isFuture,
      statusColor: isFuture ? 'bg-green-500' : 'bg-destructive',
      startLabel: `${formatDateTime(slate.min_start_time)} ${slate.startTimeSuffix ?? ''}`.trim(),
      startISO: new Date(slate.min_start_time).toISOString(),
    }
  }, [slate.min_start_time, slate.startTimeSuffix])

  return (
    <section className="relative flex flex-col md:flex-row bg-card rounded-md border-l-2 border-accent overflow-hidden">
      <Image
        src={slate.sport === 'NFL' ? '/nfl-1.png' : '/ncaa-1.png'}
        className={`absolute  z-10 ${slate.sport === 'NFL' ? '-top-16 -left-20 opacity-5' : '-top-16 -left-20 opacity-10'}`}
        alt="Fantasy Edge"
        width={400}
        height={288}
      />
      <span
        aria-hidden
        className={`hidden md:block w-3 h-3 rounded-full mt-8 ml-4 mr-2 z-20 ${statusColor}`}
      />

      <div className="flex-grow flex flex-col p-4 z-20">
        <header className="flex justify-between border-b py-2 uppercase z-20">
          <h4 className="text-foreground font-black text-2xl">
            <span className="truncate">
              {slate.sport} <time dateTime={startISO}>{startLabel}</time>{' '}
              <span className="text-muted text-lg pl-4">{slate.name}</span>
            </span>
            <span className="sr-only">{isFuture ? 'Upcoming' : 'Completed'}</span>
          </h4>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-4 text-sm">
            <button
              onClick={() => onAddProjections(slate)}
              className="flex items-center text-primary"
            >
              <CloudUpload size={16} className="mr-2" aria-hidden /> Upload Projections
            </button>
            <button
              onClick={() => onDeleteSlate(slate)}
              className="flex items-center text-destructive"
            >
              <Trash2 size={16} className="mr-2" aria-hidden /> Delete
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2" aria-label="Open actions">
                  <MoreVertical size={20} aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onAddProjections(slate)}>
                  <CloudUpload size={16} className="mr-2" aria-hidden /> Upload Projections
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onDeleteSlate(slate)}
                  className="text-destructive"
                >
                  <Trash2 size={16} className="mr-2" aria-hidden /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-10 pt-4 text-xs uppercase">
          <Count label="Games" value={slate.gameCount} />
          <Count label="Targeted Players" value={slate.targetCount} />
          <div>
            <div className="text-foreground text-xs uppercase text-center font-bold z-20">
              Projections
            </div>
            <div className="mt-2 flex justify-center">
              {slate.has_projections ? (
                <CheckCircle size={16} className="text-green-500" aria-label="Has projections" />
              ) : (
                <XCircle size={16} className="text-destructive" aria-label="No projections" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Manage Button */}
        <div className="md:hidden mt-4">
          <ManageSlateLink slateId={slate.id} className="w-full justify-center" />
        </div>
      </div>

      {/* Desktop Manage Section */}
      <aside className="hidden md:flex flex-col justify-around w-[250px] px-6 border-l border-border">
        <ManageSlateLink slateId={slate.id} />
        <div>
          <div className="text-muted text-sm font-bold">Start Time</div>
          <div className="text-sm">{formatDateTime(slate.min_start_time)}</div>
        </div>
      </aside>

      {/* Mobile Last Updated */}
      <div className="md:hidden px-4 pb-4 text-xs">
        <div className="text-muted font-bold">Start Time</div>
        <div>{formatDateTime(slate.min_start_time)}</div>
      </div>
    </section>
  )
}

function ManageSlateLink({ slateId, className = '' }: { slateId: string; className?: string }) {
  return (
    <Link
      href={`n-slate-manager/${slateId}`}
      className={`btn-accent inline-flex items-center gap-2 ${className}`}
    >
      <span className="mr-2 py-1 px-2 text-primary">Manage Slate</span>
      <ArrowRightCircle size={16} aria-hidden />
    </Link>
  )
}

function Count({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-foreground text-xs uppercase text-center font-bold z-20">{label}</div>
      <div className="font-bold text-primary text-center text-lg z-20">{value}</div>
    </div>
  )
}
