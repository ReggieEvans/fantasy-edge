export type ToggleValue = 'both' | 'home_team' | 'away_team'
export type PosAbb = 'QB' | 'RB' | 'WR' | 'TE' | 'DST'

export const sportPositions: Record<string, { position: string; positionAbb: PosAbb }[]> = {
  NFL: [
    { position: 'Quarterback', positionAbb: 'QB' },
    { position: 'Running Back', positionAbb: 'RB' },
    { position: 'Wide Receiver', positionAbb: 'WR' },
    { position: 'Tight End', positionAbb: 'TE' },
    { position: 'Defense', positionAbb: 'DST' },
  ],
  CFB: [
    { position: 'Quarterback', positionAbb: 'QB' },
    { position: 'Running Back', positionAbb: 'RB' },
    { position: 'Wide Receiver', positionAbb: 'WR' },
  ],
}
