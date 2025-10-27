import { zodResolver } from '@hookform/resolvers/zod'
import { Ban, Loader } from 'lucide-react'
import * as React from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

import { RosterFormSchema, RosterFormValues } from '../../_schema/rosterForm.schema'
import { ROSTER_TYPE_META, ROSTER_TYPE_VALUES } from './RosterTypeMeta'

export interface RosterFormProps {
  defaultValues?: Partial<RosterFormValues>
  onSubmit?: (values: RosterFormValues) => void | Promise<void>
  submitting?: boolean
  onClose: () => void
  isUpdating: boolean
  isDeleting: boolean
  handleRemoveRoster: (rosterId: string) => void | Promise<void>
  rosterId: string
}

const EMPTY = '__EMPTY__' as const

export default function RosterForm({
  defaultValues,
  onSubmit,
  onClose,
  isUpdating,
  isDeleting,
  handleRemoveRoster,
  rosterId,
}: RosterFormProps) {
  const form = useForm<RosterFormValues>({
    resolver: zodResolver(RosterFormSchema),
    defaultValues: {
      roster_type: defaultValues?.roster_type ?? undefined,
      roster_name: defaultValues?.roster_name ?? '',
    },
    mode: 'onChange',
  })

  const handleSubmit = async () => {
    const values = form.getValues()
    try {
      await onSubmit?.(values)
    } catch (err) {
      toast({
        title: 'Error Updating Roster',
        description: `There was an error updating the roster`,
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
            name="roster_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted text-sm">Roster Type</FormLabel>
                <Select
                  onValueChange={v => field.onChange(v === EMPTY ? undefined : v)}
                  value={field.value ? field.value : EMPTY}
                >
                  <FormControl className="order border-slate-700">
                    <SelectTrigger aria-label="Select roster type">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card">
                    <SelectItem value={EMPTY}>
                      <span className="flex items-center gap-2 text-[14px]">
                        <Ban size={14} /> No Type
                      </span>
                    </SelectItem>

                    {ROSTER_TYPE_VALUES.filter(v => v !== '').map(val => {
                      const { Icon, label } = ROSTER_TYPE_META[val as keyof typeof ROSTER_TYPE_META]
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
            name="roster_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted text-sm">Roster Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Roster Name..."
                    className="order border-slate-700"
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
              className="text-muted hover:bg-transparent hover:text-destructive"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleRemoveRoster(rosterId)}
                disabled={isUpdating || isDeleting}
                className="flex justify-center text-foreground bg-destructive hover:brightness-75 text-sm w-20 py-2 px-8 rounded transition-all duration-300"
              >
                {isDeleting ? <Loader className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
              <button
                type="submit"
                disabled={isUpdating || isDeleting}
                className="flex justify-center btn-accent w-20"
              >
                {isUpdating ? <Loader className="w-4 h-4 animate-spin" /> : 'Update'}
              </button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
