/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from 'papaparse'
import { useCallback, useState } from 'react'

import { RawRow } from '../types/rawRow'
import { Row } from '../types/row'
import { bucketOf, intish, modeOf, money, parseDate, seasonFor, ymd } from '../utils'

export function useDraftKingsCsv() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  const onFile = useCallback((file: File) => {
    setError('')
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: res => {
        try {
          const mapped: Row[] = (res.data || []).map(r => {
            const d = parseDate(r.Contest_Date_EST)
            if (!d) throw new Error('Invalid date in CSV')
            const sport = String(r.Sport || '')
              .toUpperCase()
              .trim()
            const entries = intish(r.Contest_Entries)
            const entryFee = money(r.Entry_Fee)
            const winnings = money(r.Winnings_Non_Ticket)
            return {
              sport,
              game_type: String(r.Game_Type || ''),
              entry_name: String(r.Entry || ''),
              contest_key: String(r.Contest_Key || ''),
              dt: d.toISOString(),
              date: ymd(d),
              place: intish(r.Place),
              points: r.Points != null ? Number(r.Points) : null,
              winnings,
              winnings_ticket: money(r.Winnings_Ticket),
              entries,
              entry_fee: entryFee,
              prize_pool: r.Prize_Pool != null ? money(r.Prize_Pool) : null,
              places_paid: intish(r.Places_Paid),
              season: seasonFor(d),
              mode: modeOf(String(r.Game_Type || '')),
              contest_bucket: bucketOf(String(r.Entry || ''), entries ?? undefined),
              profit: winnings - entryFee,
            }
          })
          setRows(mapped)
        } catch (e: any) {
          setError(e?.message || 'Failed to parse the CSV.')
        }
      },
      error: err => setError(err?.message || 'Failed to read the CSV.'),
    })
  }, [])
  return { rows, error, onFile }
}
