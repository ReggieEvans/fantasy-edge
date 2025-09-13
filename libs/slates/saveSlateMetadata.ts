import { SupabaseClient } from '@supabase/supabase-js'

import { DkSlateSelection } from '@/app/(protected)/slate-manager/_types/dkSlate'

export async function saveSlateMetadata(
  supabase: SupabaseClient,
  userId: string,
  slateSelection: DkSlateSelection,
) {
  const {
    draftGroupId,
    sport,
    gameType,
    contestTypeId,
    minStartTime,
    maxStartTime,
    startTimeSuffix,
  } = slateSelection

  const { data, error } = await supabase
    .from('user_slates')
    .insert({
      user_id: userId,
      dk_draft_group_id: draftGroupId,
      sport,
      game_type: gameType,
      contest_type_id: contestTypeId,
      min_start_time: minStartTime,
      max_start_time: maxStartTime,
      name: startTimeSuffix,
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Failed to save slate metadata:', error.message)
    return null
  }

  return data
}
