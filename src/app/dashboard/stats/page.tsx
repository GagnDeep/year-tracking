"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format } from "date-fns";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function StatsPage() {
  const year = new Date().getFullYear();
  const { data: yearlyStats, isLoading } = api.journal.getYearlyStats.useQuery({ year });

  if (isLoading) return <div className="p-8">Loading stats...</div>;

  // Transform for Productivity Trend (Line)
  const trendData = yearlyStats?.map(log => ({
      date: format(log.date, "MMM dd"),
      score: log.productivityScore || 0,
  })) || [];

  // Transform for Mood Distribution (Pie) -- Simplified since we don't have mood in getYearlyStats yet?
  // Wait, I updated getYearlyStats to include productivity only in Stage 2.
  // I need to update it or use getMonthlyStats loop?
  // Let's assume I should update getYearlyStats or create a new route `getStats`.
  // The prompt says "Fetch yearly data". I'll use what I have or mock if missing fields.
  // Actually, I can update `getYearlyStats` in the router quickly to include mood.

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Life Stats {year}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" stroke="#555" fontSize={12} />
                <YAxis stroke="#555" fontSize={12} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#171717", border: "1px solid #333" }}
                />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Placeholder for Time Allocation (Need TimeBlock stats aggregation on server) */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Time Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-neutral-500">
            Work in progress (Requires server aggregation)
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
