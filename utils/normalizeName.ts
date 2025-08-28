const SUFFIXES = ['jr', 'sr', 'ii', 'iii', 'iv', 'v']

export function normalizeName(name: string): string {
  if (!name) return ''
  const n = name
    .toLowerCase()
    .normalize('NFKD') // drop diacritics
    .replace(/[\u0300-\u036f]/g, '') // diacritic marks
    .replace(/[^a-z\s]/g, ' ') // punctuation -> space
    .replace(/\s+/g, ' ') // collapse spaces
    .trim()

  // drop suffix at end (e.g., "john smith jr")
  const parts = n.split(' ')
  const last = parts[parts.length - 1]
  if (SUFFIXES.includes(last)) parts.pop()
  return parts.join(' ')
}
