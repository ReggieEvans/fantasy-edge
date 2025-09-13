import { Bug } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type ErrorMessageProps = {
  errorTitle: string
  errorMessage: string
}

export const ErrorMessage = ({ errorTitle, errorMessage }: ErrorMessageProps) => {
  return (
    <Alert variant="destructive">
      <Bug size={20} aria-hidden />
      <div className="flex gap-2 ml-2">
        <div className="flex">
          <div className="w-[1px] h-full bg-destructive"></div>
          <div className="flex flex-col ml-4 mt-1">
            <AlertTitle className="text-lg font-bold">{errorTitle}</AlertTitle>
            <AlertDescription className="py-2 text-sm text-destructive">
              <p>{errorMessage}</p>
            </AlertDescription>
          </div>
        </div>
      </div>
    </Alert>
  )
}
