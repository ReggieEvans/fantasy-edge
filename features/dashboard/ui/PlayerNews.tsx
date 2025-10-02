import { Loader } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { useGetPlayerNewsQuery } from '../api/playerNews.api'

export default function PlayerNews({ sport }: { sport: 'NFL' | 'CFB' }) {
  const { data: playerNews, isLoading } = useGetPlayerNewsQuery({ sport })
  console.log(playerNews)
  return (
    <div className="bg-background-secondary rounded border border-muted-bg">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-accent">
        <h2 className="text-lg font-bold text-foreground ">Player News</h2>
      </div>
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 pt-12">
              <Loader className="animate-spin" />
              <p className="text-base text-muted">Loading player news...</p>
            </div>
          </div>
        )}
        {playerNews && (
          <div className="flex items-center justify-center">
            <div className="flex flex-col gap-2 w-full h-[900px] max-h-[900px] overflow-y-auto">
              {playerNews.map(news => (
                <div
                  key={news.id}
                  className="flex gap-4 items-start text-sm text-muted bg-card rounded p-2"
                >
                  <div className="w-[32px] h-[32px] min-w-[32px] min-h-[32px]">
                    <Image
                      src={news.athlete.team.logos[1].href || ''}
                      alt={news.athlete.team.displayName}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <div className="flex items-end justify-between mb-[1px]">
                      <p className="font-bold text-foreground text-lg">
                        {news.athlete.displayName}{' '}
                        <span className="text-muted text-sm">
                          ({news.athlete.position.abbreviation})
                        </span>
                      </p>
                      <Badge
                        className={`uppercase rounded-sm bg-destructive text-foreground text-xs py-[1px] ${news.type.abbreviation === 'A' ? 'bg-blue-800 border-blue-500' : 'bg-destructive border-red-400'}`}
                      >
                        {news.type.abbreviation}
                      </Badge>
                    </div>
                    <Separator className="w-full bg-muted-bg" />
                    <p className="mt-2">{news.shortComment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
