import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function PlayerPoolDialog() {
  return (
    <DialogContent className="bg-background-darker p-0 m-0">
      <DialogHeader className="border-b border-accent bg-card m-0 px-6 py-5 rounded-t">
        <DialogTitle>Player Pool</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2 px-6 pb-12">
        <h2 className="text-lg font-bold">Feature coming soon!</h2>
        <p className="text-sm text-muted">
          In the future, you will be able to manage your targeted players here.
        </p>
      </div>
    </DialogContent>
  )
}
