import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { RosterFormValues } from '../../_schema/rosterForm.schema'
import { RosterView } from '../../_types/roster'
import RosterForm from './RosterForm'
import { RosterType } from './RosterTypeMeta'

export default function EditRosterModal({
  open,
  onClose,
  selectedRoster,
  handleSubmitRoster,
  isUpdating,
  isDeleting,
  handleRemoveRoster,
}: {
  open: boolean
  onClose: () => void
  selectedRoster: RosterView
  handleSubmitRoster: (values: RosterFormValues) => void | Promise<void>
  isSaving?: boolean
  isUpdating: boolean
  isDeleting: boolean
  handleRemoveRoster: (rosterId: string) => void | Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogDescription className="sr-only">Target Player</DialogDescription>
      <DialogContent className="p-0">
        <DialogHeader className="bg-background-secondary p-4 rounded-t">
          <DialogTitle className="text-xl text-foreground">Updating Roster</DialogTitle>
        </DialogHeader>
        <RosterForm
          key={(selectedRoster?.id ?? 'new') + ':' + (selectedRoster?.id ?? '')} // force a clean mount per roster/mode
          defaultValues={
            selectedRoster
              ? {
                  roster_type: selectedRoster.type as RosterType | null,
                  roster_name: selectedRoster.name ?? '',
                }
              : {
                  roster_type: null,
                  roster_name: '',
                }
          }
          onSubmit={handleSubmitRoster}
          onClose={onClose}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          handleRemoveRoster={handleRemoveRoster}
          rosterId={selectedRoster.id}
        />
      </DialogContent>
    </Dialog>
  )
}
