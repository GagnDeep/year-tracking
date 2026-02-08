"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsPage() {
  const { data: stats, isLoading } = api.task.getWeeklyStats.useQuery();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Productivity Stats</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
                <div className="h-full w-full flex items-end justify-between gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="w-8 h-[50%]" />
                    ))}
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "4px", color: "hsl(var(--card-foreground))" }}
                        cursor={{fill: 'hsl(var(--muted)/0.2)'}}
                    />
                    <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
