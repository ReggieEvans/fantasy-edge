export function formatReadableDate(dateString?: string) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return ''
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
  const md = `${d.getMonth() + 1}/${d.getDate()}`
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${weekday}, ${md}, ${time}`
}
