import { ClipboardCheck } from 'lucide-react'

export default function RosterViewPage() {
  return (
    <div className="flex flex-col bg-background pt-3 rounded-tl-[40px] min-h-[calc(100vh-90px)] overflow-y-auto">
      <div className="flex flex-col py-4 px-6 text-muted">
        <div className="flex flex-col justify-between mb-2 text-foreground">
          <div className="flex items-center gap-2 mb-2">
            <span>
              <ClipboardCheck size={20} />
            </span>
            <h1 className="text-xl font-bold uppercase">Roster Export</h1>
          </div>
          <p className="text-muted text-sm">
            The player pool is a list of players that you have targeted for your slate. From here you can filter, sort,
            edit and delete targets in your pool.
          </p>
        </div>
      </div>
    </div>
  )
}
