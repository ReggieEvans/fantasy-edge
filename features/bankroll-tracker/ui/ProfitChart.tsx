/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { ResponsiveContainer } from 'recharts'
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PALETTE = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
]

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const CustomizedAxisTick: React.FC<{ dy?: number; format?: (s: string) => string }> = props => {
  const { x, y, payload, dy = 14, format } = props as any
  const raw = String(payload?.value ?? '')
  const label = format ? format(raw) : raw.slice(5)

  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={dy} textAnchor="middle" fill="#5c5d6f" fontSize={13}>
        {label}
      </text>
    </g>
  )
}

export default function ProfitChart({ seriesKeys, data }: { seriesKeys: string[]; data: any[] }) {
  const colorMap = React.useMemo(() => {
    const m: Record<string, string> = {}
    seriesKeys.forEach((k, i) => (m[k] = PALETTE[i % PALETTE.length]))
    return m
  }, [seriesKeys])

  return (
    <Card className="col-span-2 bg-background-secondary border border-muted-bg rounded p-0">
      <CardHeader className="flex justify-between bg-card py-4 border-b border-accent">
        <CardTitle className="font-bold">Cumulative Profit Over Time</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="h-72 rounded-md">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsAreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              {/* one vertical gradient per series */}
              <defs>
                {seriesKeys.map(k => {
                  const id = `grad-${slug(k)}`
                  const c = colorMap[k]
                  return (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  )
                })}
              </defs>

              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={24} tick={<CustomizedAxisTick dy={16} />} />
              <YAxis tickFormatter={v => `$${v}`} width={56} fontSize={13} stroke="#5c5d6f" />
              <Tooltip
                formatter={(v: any) =>
                  Number.isFinite(+v)
                    ? (+v).toLocaleString(undefined, {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 2,
                      })
                    : v
                }
              />
              <Legend verticalAlign="top" align="right" height={36} />

              {/* translucent filled areas with a stroked outline */}
              {seriesKeys.map(k => (
                <Area
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={colorMap[k]}
                  strokeWidth={2}
                  fill={`url(#grad-${slug(k)})`}
                  fillOpacity={1}
                  connectNulls
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </RechartsAreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
