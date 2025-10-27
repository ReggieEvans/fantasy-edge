import { SerializedError } from '@reduxjs/toolkit'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return ''

  if ('status' in error) {
    const err = error as FetchBaseQueryError

    if (err.data && typeof err.data === 'object' && 'error' in err.data) {
      return (err.data as { error: string }).error
    }

    return typeof err.data === 'string' ? err.data : JSON.stringify(err.data)
  }

  return error.message ?? 'Unknown error'
}
