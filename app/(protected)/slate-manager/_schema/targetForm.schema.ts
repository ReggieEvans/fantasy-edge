import { z } from 'zod'

import { TARGET_TYPE_VALUES } from '../_types/target'

export const TargetFormSchema = z.object({
  target_type: z.enum(TARGET_TYPE_VALUES).optional().nullable(),
  stack_candidate: z.boolean(),
  target_notes: z
    .string()
    .trim()
    .max(10000, { message: 'Notes must be 10,000 characters or fewer.' })
    .optional()
    .transform(v => (v ? v : undefined)), // empty string -> undefined
})

export type TargetPlayerFormValues = z.infer<typeof TargetFormSchema>
