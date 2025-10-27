import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface LogoutProps {
  displayName: string
  logout: () => Promise<void>
}

export function Logout({ displayName, logout }: LogoutProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          {displayName}{' '}
          <span>
            <ChevronDownIcon />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-24 bg-card" align="start">
        <DropdownMenuItem className="cursor-pointer hover:text-destructive rounded" onClick={logout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
