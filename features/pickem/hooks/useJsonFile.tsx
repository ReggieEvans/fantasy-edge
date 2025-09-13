'use client'
import { useCallback, useState } from 'react'

export function useJsonFile() {
  const [rawJson, setRawJson] = useState<unknown[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(String(evt.target?.result))
        setRawJson(parsed)
        setError(null)
      } catch (err) {
        setRawJson(null)
        setError(err instanceof Error ? err.message : 'Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }, [])

  return { rawJson, fileName, error, onFileChange }
}
