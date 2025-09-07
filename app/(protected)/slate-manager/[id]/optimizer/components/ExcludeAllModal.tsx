import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function ExcludeAllModal({
  open,
  onClose,
  onExcludeAll,
  isAllExcluded,
}: {
  open: boolean
  onClose: () => void
  onExcludeAll: () => void
  isAllExcluded: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isAllExcluded ? 'Include All Players' : 'Exclude All Players'}</DialogTitle>
          <DialogDescription>
            Are you sure you want to {isAllExcluded ? 'include' : 'exclude'} all players?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onExcludeAll}>
            {isAllExcluded ? 'Include All' : 'Exclude All'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
