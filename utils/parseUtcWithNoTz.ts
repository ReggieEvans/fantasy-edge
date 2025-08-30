export function parseUtcWhenNoTZ(input: unknown): number {
  if (input == null) return NaN

  if (typeof input === 'number') return input < 1e12 ? input * 1000 : input // secs→ms
  if (input instanceof Date) return input.getTime()

  if (typeof input === 'string') {
    const s = input.trim().replace(' ', 'T') // normalize "YYYY-MM-DD HH:mm:ss"
    const hasTZ = /[zZ]|[+\-]\d\d:?\d\d$/.test(s)
    const iso = hasTZ ? s : s + 'Z' // assume UTC if missing
    return Date.parse(iso)
  }

  return NaN
}
