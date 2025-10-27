export type ContestUsageSummary = {
  usersCount: number
  totalDistinct: { low: number; avg: number; high: number }
  QB: { low: number; avg: number; high: number }
  RB: { low: number; avg: number; high: number }
  WR: { low: number; avg: number; high: number }
  TE: { low: number; avg: number; high: number }
  DST: { low: number; avg: number; high: number }
}
