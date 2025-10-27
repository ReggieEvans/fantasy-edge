import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { pct } from '@/shared/utils'
import { cn } from '@/utils/cn'

import { $ } from '../utils'

export default function Headline({
  spent,
  won,
  roi,
  contests,
}: {
  spent: number
  won: number
  roi: number
  contests: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 py-2">
      <Card className="bg-cyan-700/30 border border-cyan-700 rounded p-0 h-24">
        <CardHeader className="pt-4 pb-1">
          <CardTitle className="text-sm">Contests</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-black px-6 py-0">
          {contests.toLocaleString()}
        </CardContent>
      </Card>
      <Card className="bg-cyan-700/30 border border-cyan-700 rounded p-0 h-24">
        <CardHeader className="pt-4 pb-1">
          <CardTitle className="text-sm">Entry Fees</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-black px-6 py-0">{$(spent)}</CardContent>
      </Card>
      <Card className="bg-cyan-700/30 border border-cyan-700 rounded p-0 h-24">
        <CardHeader className="pt-4 pb-1">
          <CardTitle className="text-sm">Winnings</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-black px-6 py-0">{$(won)}</CardContent>
      </Card>
      <Card
        className={cn(
          'text-3xl font-black rounded p-0 h-24',
          won - spent >= 0
            ? 'bg-emerald-700/50 border border-emerald-700'
            : 'bg-red-700/50 border border-red-700',
        )}
      >
        <CardHeader className="pt-4 pb-1">
          <CardTitle className="text-sm">Net</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-black px-6 py-0">{$(won - spent)}</CardContent>
      </Card>
      <Card
        className={cn(
          'text-4xl font-black rounded p-0 h-24',
          roi >= 0
            ? 'bg-emerald-700/50 border border-emerald-700'
            : 'bg-red-700/50 border border-red-700',
        )}
      >
        <CardHeader className="pt-4 pb-1">
          <CardTitle className="text-sm">ROI</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-black px-6 py-0">
          {Number.isFinite(roi) ? pct(roi) : '—'}
        </CardContent>
      </Card>
    </div>
  )
}
