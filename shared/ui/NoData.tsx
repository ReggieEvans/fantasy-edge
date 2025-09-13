type NoDataProps = {
  title: string
  description: string
}

export const NoData = ({ title, description }: NoDataProps) => {
  return (
    <div className="flex flex-col items-center justify-center max-w-[350px] mx-auto pt-24 space-y-2">
      <h2 className="text-muted text-center text-lg font-bold opacity-70">{title}</h2>
      <p className="text-muted text-center text-sm opacity-50">{description}</p>
    </div>
  )
}
