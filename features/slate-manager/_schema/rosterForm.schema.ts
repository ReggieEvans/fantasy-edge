import { z } from 'zod'

import { ROSTER_TYPE_VALUES } from '../roster-view/ui/RosterTypeMeta'

export const RosterFormSchema = z.object({
  roster_type: z.enum(ROSTER_TYPE_VALUES).optional().nullable(),
  roster_name: z
    .string()
    .trim()
    .max(20, { message: 'Roster name must be 20 characters or fewer.' })
    .optional()
    .transform(v => (v ? v : undefined)),
})

export type RosterFormValues = z.infer<typeof RosterFormSchema>
