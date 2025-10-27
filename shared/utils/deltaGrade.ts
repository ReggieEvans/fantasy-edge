export function getDeltaGrade(
  score: number,
  reverse: boolean = false,
): { grade: string; bgClass: string } {
  const finalScore = reverse ? -score : score

  if (finalScore >= 80)
    return { grade: 'A+', bgClass: 'bg-cyan-800/60 text-foreground border border-cyan-700' }
  if (finalScore >= 60)
    return { grade: 'A', bgClass: 'bg-cyan-600/60 text-foreground border border-cyan-600' }
  if (finalScore >= 40)
    return { grade: 'A-', bgClass: 'bg-cyan-500/60 text-foreground border border-cyan-500' }
  if (finalScore >= 20)
    return { grade: 'B+', bgClass: 'bg-green-700/60 text-foreground border border-green-700' }
  if (finalScore >= 0)
    return { grade: 'B', bgClass: 'bg-green-600/60 text-foreground border border-green-600' }
  if (finalScore >= -20)
    return { grade: 'B-', bgClass: 'bg-green-500/60 text-foreground border border-green-500' }
  if (finalScore >= -40)
    return { grade: 'C', bgClass: 'bg-yellow-500/60 text-foreground border border-yellow-500' }
  if (finalScore >= -60)
    return { grade: 'D', bgClass: 'bg-orange-500/60 text-foreground border border-orange-500' }
  if (finalScore >= -80)
    return { grade: 'F', bgClass: 'bg-red-600/60 text-foreground border border-red-600' }
  return { grade: '☠️', bgClass: 'bg-red-800 text-foreground border border-red-800' }
}

export function getOffensiveDeltaGrade(score: number) {
  return getDeltaGrade(score)
}

export function getDefensiveDeltaGrade(score: number) {
  return getDeltaGrade(-score)
}
