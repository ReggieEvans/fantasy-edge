export const formatDateTime = (dateString: string) => {
  // Parse as UTC if no Z
  let date: Date
  if (dateString.endsWith('Z')) {
    date = new Date(dateString)
  } else {
    const [datePart, timePart] = dateString.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = (timePart || '00:00').split(':').map(Number)
    date = new Date(Date.UTC(year, month - 1, day, hour, minute))
  }

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: userTimeZone }).format(date)
  const md = new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', timeZone: userTimeZone }).format(date)
  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit', // no seconds
    hour12: true,
    timeZone: userTimeZone,
  }).format(date)

  return `${day}, ${md}, ${time}`
}
