'use client'

import { Loader, Plus } from 'lucide-react'
import { useState } from 'react'

// import { useAddProjectionsMutation } from '@/app/(protected)/cfb/slate-manager/_api/projections.api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { formatDateTime } from '@/utils/formatDkTime'

import { useUploadProjectionsMutation } from '../_api/players'
import { Slate } from '../_types/slate'

export default function AddProjectionsModal({
  open,
  onClose,
  slate,
}: {
  open: boolean
  onClose: () => void
  slate: Slate
}) {
  const [file, setFile] = useState<File | null>(null)
  const [upload, { isLoading, data, error }] = useUploadProjectionsMutation()

  const onAddProjections = async () => {
    try {
      if (!file) return
      const csvText = await file.text()
      await upload({ slateId: slate.id, csvText }).unwrap()
      toast({
        title: 'Projections Added Successfully!',
        description: `The projections have been added to your slate.`,
        variant: 'default',
      })
      onClose()
    } catch {
      toast({
        title: 'Error Adding Projections',
        description: `There was an error adding the projections to your slate.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogDescription className="sr-only">Add Projections</DialogDescription>
      <DialogContent className="p-0">
        <DialogHeader className="bg-background-secondary p-4 rounded-t">
          <DialogTitle className="text-xl text-foreground">Add Projections</DialogTitle>
        </DialogHeader>

        <div className="py-2 px-4">
          <h2 className="text-accent text-lg font-bold">
            {formatDateTime(slate.min_start_time)} {slate.startTimeSuffix}
          </h2>
          <p className="text-foreground text-sm font-bold mb-4">{slate.gameCount} game slate</p>
          <p className="text-muted text-sm mb-4">
            Upload a CSV file containing projections for the above slate. We will look for the following two columns:
            &quot;Player Name&quot; and &quot;Pnts&quot;.
          </p>
          <div className="grid w-full max-w-sm items-center gap-3 py-4">
            <Label htmlFor="projections" className="px-1">
              College Football Projections
            </Label>
            <Input id="projections" type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        {data && (
          <div className="mt-3 text-sm">
            <p>Updated: {data.updated}</p>
            {data.unmatchedCsv.length > 0 && (
              <>
                <p className="mt-2 font-medium">Unmatched (CSV names):</p>
                <ul className="list-disc ml-5 max-h-40 overflow-auto">
                  {data.unmatchedCsv.map(n => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {error && <p className="text-red-500">Upload failed.</p>}

        <DialogFooter className="flex justify-end gap-4 p-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button className="btn-accent" onClick={onAddProjections} disabled={isLoading}>
            {isLoading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
            {isLoading ? 'Uploading…' : 'Upload CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
