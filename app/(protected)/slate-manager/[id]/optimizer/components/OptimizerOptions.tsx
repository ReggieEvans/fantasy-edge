export default function OptimizerOptions() {
  return (
    <div className="text-sm rounded-t bg-background-secondary">
      <ul className="flex border-b-2 border-background">
        <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
          Game Filters
        </li>
        <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
          Advanced Options
        </li>
        <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
          Upload Projections
        </li>
        <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
          Contest Data
        </li>
        <li className="w-48 py-3 border-r-2 border-background text-center text-xs uppercase font-bold hover:bg-background-darker hover:cursor-pointer transition-all duration-300">
          Player Pool
        </li>
      </ul>
    </div>
  )
}
