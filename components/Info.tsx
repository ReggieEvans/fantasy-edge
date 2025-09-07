import { InfoIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function Info(props: { title: string; content: string }) {
  const { title, content } = props
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <InfoIcon className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-background-darker border border-background-secondary">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">{title}</h4>
            <p className="text-muted-foreground text-sm">{content}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
