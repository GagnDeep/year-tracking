export function YearGridSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-secondary/50 rounded animate-pulse" />
          <div className="h-4 w-48 bg-secondary/30 rounded animate-pulse hidden sm:block" />
      </div>
      <div className="flex flex-wrap gap-1.5 p-4 border border-border rounded-xl bg-card/50 shadow-sm">
        {Array.from({ length: 365 }).map((_, i) => (
          <div
            key={i}
            className="h-4 w-4 rounded-sm bg-secondary/30 animate-pulse"
            style={{ animationDelay: `${i * 2}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
