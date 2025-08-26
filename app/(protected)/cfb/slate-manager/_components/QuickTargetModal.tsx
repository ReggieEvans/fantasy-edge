import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function QuickTargetModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">Quick Target</DialogTitle>
        </DialogHeader>
        <div className="mt-4 h-[400px] overflow-y-scroll">
          {/* Replace this with your actual quick pick logic */}
          <div className="text-sm text-muted-foreground">Coming soon...</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
