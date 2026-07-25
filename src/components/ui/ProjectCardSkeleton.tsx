export default function ProjectCardSkeleton({ 
  isFeatured = false 
}: { 
  isFeatured?: boolean 
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[2rem] border ${
        isFeatured 
        ? "border-zinc-300 dark:border-white/10 bg-zinc-100/60 dark:bg-zinc-900/50 p-8 lg:p-12" 
        : "border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] p-8 md:p-10"
      }`}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div className="h-4 w-12 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
            <div className="h-6 w-24 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
          </div>

          {/* Title */}
          <div className="mb-4 h-6 w-3/4 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
          
          {/* Description lines */}
          <div className="space-y-3">
            <div className="h-4 w-full rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
            <div className="h-4 w-5/6 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
          </div>

          {/* Impact */}
          <div className="mt-5 h-3 w-1/3 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
        </div>

        {/* Footer (Tech + Arrow) */}
        <div className="mt-auto pt-8 flex items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: isFeatured ? 5 : 3 }).map((_, i) => (
              <div 
                key={i} 
                className="h-6 w-16 rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" 
                style={{ width: `${[65, 78, 62, 70][i % 4]}px` }}
              />
            ))}
          </div>

          {/* Arrow Placeholder */}
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
