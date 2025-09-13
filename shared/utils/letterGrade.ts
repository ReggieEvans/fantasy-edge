export function getLetterGrade(value: number | "-"): string {
  if (value === "-") return "-"
  if (value >= 97) return 'A+'
  if (value >= 93) return 'A'
  if (value >= 90) return 'A-'
  if (value >= 87) return 'B+'
  if (value >= 83) return 'B'
  if (value >= 80) return 'B-'
  if (value >= 77) return 'C+'
  if (value >= 77) return 'C'
  if (value >= 75) return 'C-'
  if (value >= 73) return 'D+'
  if (value >= 72) return 'D'
  if (value >= 70) return 'D-'
  if (value < 70) return 'F'
  return '-'
}
