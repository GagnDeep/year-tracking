import { YearGridSkeleton } from "@/components/skeletons/year-grid-skeleton";

export default function Loading() {
  return (
      <div className="h-full w-full p-4">
          <YearGridSkeleton />
      </div>
  );
}
