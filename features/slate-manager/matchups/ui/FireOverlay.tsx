import Image from 'next/image'

export function FireOverlay({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 ${className}`}
    >
      <Image src="/fire.png" alt="" width={300} height={300} aria-hidden className="scale-[1.5]" />
    </div>
  )
}
