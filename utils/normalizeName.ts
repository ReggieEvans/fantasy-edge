const SUFFIXES = ['jr', 'sr', 'ii', 'iii', 'iv', 'v']

export function normalizeName(name: string): string {
  if (!name) return ''
  const n = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const parts = n.split(' ')
  const last = parts[parts.length - 1]
  if (SUFFIXES.includes(last)) parts.pop()
  return parts.join(' ')
}
