import { DkContestDTO, DkContestsResponseDTO } from '../../_dtos/dkContests.dto'
import { DkContest } from '../types/ContestTypes'

export function toDkContests(dkContests: DkContestsResponseDTO, draftGroupId: number): DkContest[] {
  const contests: DkContestDTO[] = dkContests.Contests
  const filteredByDg = contests.filter(c => c.dg === draftGroupId)
  return filteredByDg.map((dkContest: DkContestDTO) => transformContest(dkContest))
}

export function transformContest(dkContest: DkContestDTO): DkContest {
  return {
    id: dkContest.id.toString(),
    name: dkContest.n,
    dg: dkContest.dg,
    buyIn: dkContest.a ?? 0,
    fieldMax: dkContest.m,
    entered: dkContest.ec ?? 0,
    fillPct: dkContest.nt / dkContest.m,
    prizePool: dkContest.po ?? 0,
    firstPrize: dkContest.pt ?? 0,
    firstPct: dkContest.pt / dkContest.po,
    maxEntriesPerUser: dkContest.uc,
    isSE: dkContest.sa,
    is3Max: dkContest.s === 3,
    is20Max: dkContest.s === 20,
    is150Max: dkContest.s === 150,
    isGuaranteed: dkContest.attr.IsGuaranteed === 'true',
    isDoubleUp: dkContest.attr.IsDoubleUp === 'true',
    isFifty: dkContest.attr.IsFiftyFifty === 'true',
    isQualifier: dkContest.attr.IsQualifier === 'true',
    gameType: dkContest.gameType,
  }
}
