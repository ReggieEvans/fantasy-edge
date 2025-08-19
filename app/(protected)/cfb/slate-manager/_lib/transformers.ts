import { DkSlateDTO } from '../_dto/dkSlate.dto';
import { DkSlateSelection } from '../_types/dkSlate'

export function toDkSlate(dkSlates: DkSlateDTO[]): DkSlateSelection[] {
  return dkSlates.map(dkSlate => transformSlate(dkSlate))
}

export function transformSlate(dkSlate: DkSlateDTO): DkSlateSelection {
    return {
        draftGroupId: dkSlate.draftGroup.draftGroupId,
        contestTypeId: dkSlate.draftGroup.contestType.contestTypeId,
        sport: dkSlate.draftGroup.contestType.sport,
        gameType: dkSlate.draftGroup.contestType.gameType,
        minStartTime: dkSlate.draftGroup.minStartTime,
        maxStartTime: dkSlate.draftGroup.maxStartTime,
        startTimeSuffix: dkSlate.draftGroup.startTimeSuffix,
    }
}
