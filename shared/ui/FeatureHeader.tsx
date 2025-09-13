interface FeatureHeaderProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureHeader({ icon, title, description }: FeatureHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 px-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <h1 className="text-xl font-bold uppercase">{title}</h1>
        </div>
        <p className="text-muted text-sm">{description}</p>
      </div>
    </div>
  )
}
