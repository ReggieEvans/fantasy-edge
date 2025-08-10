/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowRightCircle, CheckCircle, CloudUpload, MoreVertical, Trash2, XCircle } from 'lucide-react'
import Link from 'next/link'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface SlateProps {
  slate: any
  onAddProjections: (slate: any) => void
  onDeleteSlate: (slate: any) => void
  manageSlate: (slate: any) => void
}

export default function Slate({ slate, onAddProjections, onDeleteSlate }: SlateProps) {
  const isFuture = new Date(slate.min_start_time) > new Date()
  // Always green for demo
  const statusColor = isFuture ? 'bg-green-500' : 'bg-green-500'

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${date.getMonth() + 1}/${date.getDate()}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  }

  return (
    <div className="flex flex-col md:flex-row bg-card rounded-md">
      <div className={`hidden md:block w-3 h-3 rounded-full mt-8 ml-4 mr-2 ${statusColor}`} />

      <div className="flex-grow flex flex-col p-4">
        <div className="flex justify-between border-b py-2 uppercase">
          <h4 className="text-foreground font-black text-2xl">
            <span className="truncate">
              {formatDateTime(slate.min_start_time)} {slate.draftGroup?.startTimeSuffix}
            </span>
          </h4>

          {/* Desktop Actions */}
          <div className="hidden md:flex gap-4 text-sm">
            <button onClick={() => onAddProjections(slate)} className="flex items-center text-primary">
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
                <DropdownMenuItem onClick={() => onAddProjections(slate)}>
                  <CloudUpload size={16} className="mr-2" /> Upload Projections
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteSlate(slate)} className="text-destructive">
                  <Trash2 size={16} className="mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-10 pt-4 text-xs uppercase">
          <div>
            <div className="text-muted-foreground">Games</div>
            <div className="font-bold text-primary text-base">{slate.gameCount}</div>
          </div>
          {/* <div>
            <div className="text-muted-foreground">Available Players</div>
            <div className="font-bold text-primary text-base">
              {slate.playerCount} {slate.playerCount >= 1000 ? '+' : ''}
            </div>
          </div> */}
          <div>
            <div className="text-muted-foreground">Players Targeted</div>
            <div className="font-bold text-primary text-base">0</div>
          </div>
          <div>
            <div className="text-muted-foreground">Projections</div>
            <div className="mt-1">
              {slate.projectionsSubmitted ? (
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
          <div className="text-muted text-sm">Last Updated</div>
          <div className="text-sm">{formatDateTime(slate.min_start_time)}</div>
        </div>
      </div>

      {/* Mobile Last Updated */}
      <div className="md:hidden px-4 pb-4 text-xs">
        <div className="text-muted">Last Updated</div>
        <div>{formatDateTime(slate.min_start_time)}</div>
      </div>
    </div>
  )
}
