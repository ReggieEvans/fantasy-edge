'use client'

import { Loader, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

import { useDeleteSlateMutation } from '../_api/slates.api'
import { Slate } from '../_types/slate'

export default function DeleteSlateModal({
  open,
  onClose,
  slate,
}: {
  open: boolean
  onClose: () => void
  slate: Slate
}) {
  const [deleteSlate, { isLoading }] = useDeleteSlateMutation()

  const onDelete = async () => {
    try {
      await deleteSlate(slate.id).unwrap()
      toast({
        title: 'Slate Deleted Successfully!',
        description: `The slate has been deleted from your account.`,
        variant: 'default',
      })
      onClose()
    } catch {
      toast({
        title: 'Error Deleting Slate',
        description: `There was an error deleting the slate from your account.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogDescription className="sr-only">Delete Slate</DialogDescription>
      <DialogContent className="p-0">
        <DialogHeader className="bg-background-secondary p-4 rounded-t">
          <DialogTitle className="text-xl text-foreground">Delete Slate</DialogTitle>
        </DialogHeader>

        <p className="py-2 px-4">
          Are you sure you want to delete <strong>this</strong> slate?
        </p>

        <DialogFooter className="flex justify-end gap-4 p-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={onDelete} disabled={isLoading}>
            {isLoading ? <Loader size={16} className="animate-spin" /> : <Trash size={16} />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
