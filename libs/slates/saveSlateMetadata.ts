import { SupabaseClient } from '@supabase/supabase-js'

import { DkSlateSelection } from '@/app/(protected)/cfb/slate-manager/_types/dkSlate'

export async function saveSlateMetadata(supabase: SupabaseClient, userId: string, slateSelection: DkSlateSelection) {
  const { draftGroupId, sport, gameType, minStartTime, maxStartTime } = slateSelection

  const { data, error } = await supabase
    .from('user_slates')
    .insert({
      user_id: userId,
      dk_draft_group_id: draftGroupId,
      sport,
      game_type: gameType,
      min_start_time: minStartTime,
      max_start_time: maxStartTime,
    })
    .select()
    .single()

  if (error) {
    console.error('❌ Failed to save slate metadata:', error.message)
    return null
  }

  return data
}
