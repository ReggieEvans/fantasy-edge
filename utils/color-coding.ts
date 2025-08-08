interface ColorConfig {
  thresholds: number[]
  colors: {
    positive: string[]
    neutral: string
    negative: string[]
  }
  isReversed?: boolean
}

export const getColorByValue = (value: number, config: ColorConfig) => {
  const { thresholds, colors, isReversed = false } = config

  // Sort thresholds in descending order
  const sortedThresholds = [...thresholds].sort((a, b) => b - a)

  // If reversed, negative numbers are good (like in defense stats)
  const normalizedValue = isReversed ? -value : value

  if (normalizedValue === 0) return colors.neutral

  if (normalizedValue > 0) {
    for (let i = 0; i < sortedThresholds.length; i++) {
      if (normalizedValue > sortedThresholds[i]) {
        return colors.positive[i]
      }
    }
    return colors.positive[colors.positive.length - 1]
  }

  for (let i = 0; i < sortedThresholds.length; i++) {
    if (-normalizedValue > sortedThresholds[i]) {
      return colors.negative[i]
    }
  }
  return colors.negative[colors.negative.length - 1]
}

// Predefined configurations for different scenarios
export const rankDiffConfig: ColorConfig = {
  thresholds: [104, 78, 52, 26],
  colors: {
    positive: [
      'bg-grade-1-muted text-grade-1',
      'bg-grade-2-muted text-grade-2',
      'bg-grade-3-muted text-grade-3',
      'bg-grade-4-muted text-grade-4',
    ],
    neutral: 'bg-grade-neutral',
    negative: [
      'bg-grade-9-muted text-grade-9',
      'bg-grade-7-muted text-grade-7',
      'bg-grade-6-muted text-grade-6',
      'bg-grade-5-muted text-grade-5',
    ],
  },
}

// Configuration for 0-100 scale (e.g., percentages, grades)
export const pffGradeConfig: ColorConfig = {
  thresholds: [90, 80, 75, 70, 60],
  colors: {
    positive: [
      'bg-cyan-800/60 text-foreground border border-cyan-700', // 90-100: Excellent
      'bg-green-700/60 text-foreground border border-green-700', // 90-80: Great
      'bg-yellow-500/60 text-foreground border border-yellow-500', // 80-75: Good
      'bg-orange-500/60 text-foreground border border-orange-500', // 75-70: Average
      'bg-red-600/60 text-foreground border border-red-600', // below 70: Poor
    ],
    neutral: 'bg-grade-neutral', // Non-applicable
    negative: ['bg-grade-9-muted', 'bg-grade-7-muted', 'bg-grade-6-muted', 'bg-grade-neutral'],
  },
}

// Configuration for 0-100 scale (e.g., percentages, grades)
export const mktShareConfig: ColorConfig = {
  thresholds: [0.3, 0.24, 0.1, 0],
  colors: {
    positive: [
      'bg-cyan-800/60 text-foreground border border-cyan-700',
      'bg-green-800/60 text-foreground border border-green-700',
      'bg-yellow-500/60 text-foreground border border-yellow-400',
      'bg-transparent text-foreground',
    ],
    neutral: 'bg-grade-neutral', // Non-applicable
    negative: ['bg-grade-9-muted', 'bg-grade-7-muted', 'bg-grade-6-muted', 'bg-grade-neutral'],
  },
}
