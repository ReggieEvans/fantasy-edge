export function getMatchupGrade(score: number): { grade: string; bgClass: string } {
  if (score >= 80) return { grade: 'A+', bgClass: 'bg-cyan-800/60 text-foreground border border-cyan-700' }
  if (score >= 60) return { grade: 'A', bgClass: 'bg-cyan-600/60 text-foreground border border-cyan-600' }
  if (score >= 40) return { grade: 'A-', bgClass: 'bg-cyan-500/60 text-foreground border border-cyan-500' }
  if (score >= 20) return { grade: 'B+', bgClass: 'bg-green-700/60 text-foreground border border-green-700' }
  if (score >= 0) return { grade: 'B', bgClass: 'bg-green-600/60 text-foreground border border-green-600' }
  if (score >= -20) return { grade: 'B-', bgClass: 'bg-green-500/60 text-foreground border border-green-500' }
  if (score >= -40) return { grade: 'C', bgClass: 'bg-yellow-500/60 text-foreground border border-yellow-500' }
  if (score >= -60) return { grade: 'D', bgClass: 'bg-orange-500/60 text-foreground border border-orange-500' }
  if (score >= -80) return { grade: 'F', bgClass: 'bg-red-600/60 text-foreground border border-red-600' }
  return { grade: '☠️', bgClass: 'bg-red-800 text-foreground border border-red-800' }
}
