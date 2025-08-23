import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'

import { Target, TARGET_TYPE_VALUES } from '@/app/(protected)/cfb/slate-manager/_types/target'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

import { TargetFormSchema, TargetPlayerFormValues } from '../_schema/targetForm.schema'
import { TARGET_TYPE_META } from './targetTypeMeta'

export interface TargetPlayerFormProps {
  defaultValues?: Partial<TargetPlayerFormValues>
  onSubmit?: (values: TargetPlayerFormValues) => void | Promise<void>
  submitting?: boolean
  existingTarget: Target | null
  onClose: () => void
  isUpdating: boolean
  isSaving?: boolean
  isRemoving: boolean
  handleRemoveTarget: () => void
}

export default function TargetPlayerForm({
  defaultValues,
  onSubmit,
  submitting,
  existingTarget,
  onClose,
  isUpdating,
  isSaving,
  isRemoving,
  handleRemoveTarget,
}: TargetPlayerFormProps) {
  const form = useForm<TargetPlayerFormValues>({
    resolver: zodResolver(TargetFormSchema),
    defaultValues: {
      target_type: defaultValues?.target_type ?? undefined,
      stack_candidate: defaultValues?.stack_candidate ?? false,
      target_notes: defaultValues?.target_notes ?? '',
    },
    mode: 'onChange',
  })

  const handleSubmit = async (values: TargetPlayerFormValues) => {
    try {
      await onSubmit?.(values)
    } catch (err) {
      toast({
        title: 'Error Adding Target',
        description: `There was an error targeting the player`,
        variant: 'destructive',
      })
      console.error('Submit failed', err)
    }
  }

  const handleCloseModal = () => {
    onClose()
    form.reset()
  }

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="target_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted text-sm">Player Type</FormLabel>
                <Select onValueChange={value => field.onChange(value || undefined)} value={field.value || ''}>
                  <FormControl className="order border-slate-700">
                    <SelectTrigger aria-label="Select player type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card">
                    {TARGET_TYPE_VALUES.map(val => {
                      const { Icon, label } = TARGET_TYPE_META[val]
                      return (
                        <SelectItem key={val} value={val}>
                          <span className="flex items-center gap-2 text-[14px]">
                            <Icon size={14} /> {label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stack_candidate"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-slate-700 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={checked => field.onChange(Boolean(checked))}
                    className="text-lg border-muted"
                  />
                </FormControl>
                <div className="space-y-1 leading-none text-sm">
                  <FormLabel className="text-muted">Stack candidate</FormLabel>
                  <p className="text-sm text-muted-foreground">Mark this player as part of a potential stack.</p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add quick notes about why you're targeting this player (optional)"
                    className="min-h-28 order border-slate-700"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
              disabled={submitting || isUpdating || isSaving || isRemoving}
              className="text-muted hover:bg-transparent hover:text-destructive"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-4">
              {existingTarget && (
                <button
                  type="button"
                  onClick={handleRemoveTarget}
                  disabled={submitting || isUpdating || isSaving || isRemoving}
                  className="flex justify-center text-foreground bg-destructive hover:brightness-75 text-sm w-20 py-2 px-8 rounded transition-all duration-300"
                >
                  {isRemoving ? <Loader size={16} className="animate-spin" /> : 'Delete'}
                </button>
              )}
              <button type="submit" disabled={submitting} className="flex justify-center btn-accent w-20">
                {submitting || isUpdating || isSaving ? (
                  <Loader size={16} className="animate-spin" />
                ) : existingTarget ? (
                  'Update'
                ) : (
                  'Target'
                )}
              </button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
