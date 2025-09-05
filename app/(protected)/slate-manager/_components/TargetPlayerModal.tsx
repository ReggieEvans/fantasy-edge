import { Player } from '@/app/(protected)/slate-manager/_types/player'
import { Target, TargetType } from '@/app/(protected)/slate-manager/_types/target'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { TargetPool } from '../_types/targetPool'
import TargetPlayerForm from './TargetPlayerForm'

export default function TargetPlayerModal({
  open,
  onClose,
  selectedPlayer,
  existingTarget,
  handleSubmitTarget,
  isSaving,
  isUpdating,
  isRemoving,
  handleRemoveTarget,
}: {
  open: boolean
  onClose: () => void
  selectedPlayer?: Player | TargetPool | null
  existingTarget: Target | TargetPool | null
  handleSubmitTarget: (values: {
    target_type?: TargetType | null
    stack_candidate: boolean
    target_notes?: string
  }) => void
  isSaving?: boolean
  isUpdating: boolean
  isRemoving: boolean
  handleRemoveTarget: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogDescription className="sr-only">Target Player</DialogDescription>
      <DialogContent className="p-0">
        <DialogHeader className="bg-background-secondary p-4 rounded-t">
          <DialogTitle className="text-xl text-foreground">
            {existingTarget ? 'Updating' : 'Targeting'} Player
          </DialogTitle>
        </DialogHeader>
        <div className="px-4">
          <div className="text-sm font-bold text-muted">Player</div>
          <div className="text-xl font-bold">
            {selectedPlayer?.first_name} {selectedPlayer?.last_name}
          </div>
        </div>
        <TargetPlayerForm
          key={(existingTarget?.id ?? 'new') + ':' + (selectedPlayer?.id ?? '')} // force a clean mount per player/mode
          defaultValues={
            existingTarget
              ? {
                  target_type: existingTarget.target_type,
                  stack_candidate: !!existingTarget.stack_candidate,
                  target_notes: existingTarget.target_notes ?? '',
                }
              : {
                  target_type: undefined,
                  stack_candidate: false,
                  target_notes: '',
                }
          }
          existingTarget={existingTarget}
          onSubmit={handleSubmitTarget}
          onClose={onClose}
          isUpdating={isUpdating}
          isSaving={isSaving}
          isRemoving={isRemoving}
          handleRemoveTarget={handleRemoveTarget}
        />
      </DialogContent>
    </Dialog>
  )
}
