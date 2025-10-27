import Link from 'next/link'

export default function DashboardLinks() {
  return (
    <div className="bg-background-secondary rounded border border-muted-bg h-full">
      <h2 className="text-lg font-bold text-foreground px-4 py-2 bg-card border-b border-accent">
        Links
      </h2>
      <div className="flex gap-16 flex-wrap p-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-foreground">One Week Season</h3>
          <Link href="https://oneweekseason.com/projections-dk/" target="_blank">
            <span className="text-sm text-muted">NFL Projections</span>
          </Link>
          <Link href="https://oneweekseason.com/ownership-home/" target="_blank">
            <span className="text-sm text-muted">NFL Ownership</span>
          </Link>
          <Link href="https://oneweekseason.com/the-scroll/" target="_blank">
            <span className="text-sm text-muted">NFL Scroll</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-foreground">CFF Site</h3>
          <Link
            href="https://thecollegefantasyfootballsite.com/2024-weekly-projections-full-fbs-1-0-ppr/"
            target="_blank"
          >
            <span className="text-sm text-muted">CFB Projections</span>
          </Link>
          <Link
            href="https://thecollegefantasyfootballsite.com/2025-weekly-dfs-portal/"
            target="_blank"
          >
            <span className="text-sm text-muted">CFB Analysis</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-foreground">Resources</h3>
          <Link href="https://premium.pff.com/nfl/games/2025/" target="_blank">
            <span className="text-sm text-muted">Pro Football Focus</span>
          </Link>
          <Link href="https://www.teamrankings.com/nfl/stat/passing-play-pct" target="_blank">
            <span className="text-sm text-muted">Team Rankings</span>
          </Link>
          <Link href="https://www.rotowire.com/football/news.php" target="_blank">
            <span className="text-sm text-muted">Rotowire News</span>
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold text-foreground">Admin</h3>
          <span className="text-sm text-muted opacity-50 hover:cursor-not-allowed">
            FE Data Sync
          </span>
          <span className="text-sm text-muted opacity-50 hover:cursor-not-allowed">
            Lineup Exporter
          </span>
        </div>
      </div>
    </div>
  )
}
