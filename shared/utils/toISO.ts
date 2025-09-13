export function toISO(dateString?: string) {
  const d = dateString ? new Date(dateString) : null
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined
}
