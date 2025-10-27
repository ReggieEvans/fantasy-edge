type ColorConfig = {
  thresholds: number[]
  colors: {
    positive: string[]
    neutral: string
    negative: string[]
  }
  isReversed?: boolean
}

type ColorOverrides = Partial<Pick<ColorConfig, 'thresholds' | 'isReversed' | 'colors'>>

const sortDesc = (arr: number[]) => [...arr].sort((a, b) => b - a)

const pick = (arr: string[], idx: number) =>
  arr[Math.min(idx, arr.length - 1)] ?? arr[arr.length - 1]

export const getColorByValue = (
  value: number | '-',
  config: ColorConfig,
  overrides?: ColorOverrides,
): string => {
  if (value === '-') return config.colors.neutral

  const thresholds = sortDesc(overrides?.thresholds ?? config.thresholds)
  const isReversed = overrides?.isReversed ?? config.isReversed ?? false
  const colors = overrides?.colors ?? config.colors

  const v = isReversed ? -value : value
  if (v === 0) return colors.neutral

  const countExceeds = (n: number) => {
    let i = 0
    for (; i < thresholds.length; i++) if (n > thresholds[i]) break
    return i
  }

  if (v > 0) {
    const idx = countExceeds(v)
    return pick(colors.positive, idx)
  } else {
    const idx = countExceeds(-v)
    return pick(colors.negative, idx)
  }
}

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

export const pffGradeConfig: ColorConfig = {
  thresholds: [90, 85, 80, 75, 70, 60, 50, 40],
  colors: {
    positive: [
      'bg-cyan-800/60 text-foreground border border-cyan-700',
      'bg-teal-600/60 text-foreground border border-teal-600',
      'bg-green-700/60 text-foreground border border-green-700',
      'bg-green-500/60 text-foreground border border-green-500',
      'bg-lime-400/60 text-foreground border border-lime-400',
      'bg-yellow-300/60 text-foreground border border-yellow-300',
      'bg-amber-400/60 text-foreground border border-amber-400',
      'bg-orange-400/60 text-foreground border border-orange-400',
      'bg-red-600/60 text-foreground border border-red-600',
    ],
    neutral: 'bg-grade-neutral',
    negative: ['bg-grade-9-muted', 'bg-grade-7-muted', 'bg-grade-6-muted', 'bg-grade-neutral'],
  },
}

export const mktShareConfig: ColorConfig = {
  thresholds: [0.3, 0.24, 0.1, 0],
  colors: {
    positive: [
      'bg-cyan-800/60 text-foreground border border-cyan-700',
      'bg-green-800/60 text-foreground border border-green-700',
      'bg-lime-800/60 text-foreground border border-lime-700',
      'bg-transparent text-foreground',
    ],
    neutral: 'bg-grade-neutral',
    negative: ['bg-grade-9-muted', 'bg-grade-7-muted', 'bg-grade-6-muted', 'bg-grade-neutral'],
  },
}

export const targetsConfig: ColorConfig = {
  thresholds: [13, 7, 5],
  colors: {
    positive: [
      'bg-cyan-800/60 text-foreground border border-cyan-700',
      'bg-green-800/60 text-foreground border border-green-700',
      'bg-transparent text-foreground',
    ],
    neutral: 'bg-grade-neutral',
    negative: ['bg-grade-9-muted', 'bg-grade-7-muted', 'bg-grade-6-muted', 'bg-grade-neutral'],
  },
}

export const projValueConfig: ColorConfig = {
  thresholds: [3, 2.5, 2],
  colors: {
    positive: [
      'bg-cyan-800/60 text-foreground border border-cyan-700',
      'bg-green-800/60 text-foreground border border-green-700',
      'bg-transparent text-foreground',
    ],
    neutral: 'bg-grade-neutral',
    negative: ['bg-grade-9-muted', 'bg-grade-7-muted', 'bg-grade-6-muted', 'bg-grade-neutral'],
  },
}

export const basicConfig: ColorConfig = {
  thresholds: [25, 20, 15, 11],
  colors: {
    positive: [
      'bg-cyan-800/60 text-foreground border border-cyan-700',
      'bg-green-800/60 text-foreground border border-green-700',
      'bg-orange-800/60 text-foreground border border-orange-700',
      'bg-red-800/60 text-foreground border border-red-700',
      'bg-transparent text-foreground',
    ],
    neutral: 'bg-grade-neutral',
    negative: ['bg-grade-9-muted', 'bg-grade-7-muted', 'bg-grade-6-muted', 'bg-grade-neutral'],
  },
}
