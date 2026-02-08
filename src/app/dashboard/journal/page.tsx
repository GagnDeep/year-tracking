"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function JournalPage() {
  const { data: entries, isLoading } = api.journal.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Journal History</h2>
      {entries?.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 border rounded-lg border-dashed">
          No journal entries yet. Start writing on the Dashboard!
        </div>
      ) : (
        <div className="grid gap-4">
          {entries?.map((entry) => (
            <Link
              key={entry.id}
              href={`/dashboard/calendar?date=${format(entry.date, "yyyy-MM-dd")}`}
            >
              <Card className="hover:bg-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle>{format(entry.date, "EEEE, MMMM do, yyyy")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="line-clamp-3 text-sm text-muted-foreground prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: entry.content }}
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
