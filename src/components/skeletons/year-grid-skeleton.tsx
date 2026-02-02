export function YearGridSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-32 bg-neutral-800 rounded animate-pulse" />
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: 365 }).map((_, i) => (
          <div
            key={i}
            className="h-4 w-4 rounded-sm border border-neutral-800 bg-neutral-900"
          />
        ))}
      </div>
    </div>
  );
}
