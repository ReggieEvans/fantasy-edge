import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function UploadProjectionsDialog() {
  return (
    <DialogContent className="bg-background-darker p-0 m-0">
      <DialogHeader className="border-b border-accent bg-card m-0 px-6 py-5 rounded-t">
        <DialogTitle>Upload Projections</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-2 px-6 pb-12">
        <h2 className="text-lg font-bold">Feature coming soon!</h2>
        <p className="text-sm text-muted">
          In the future, in addition to being able to upload projections from the slate manager
          page, you will be able to upload your projections here.
        </p>
      </div>
    </DialogContent>
  )
}
