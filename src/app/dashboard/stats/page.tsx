"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from "recharts";
import { format } from "date-fns";
import { Trophy, Flame, TrendingUp } from "lucide-react";

const MOOD_COLORS = {
    great: "#10b981",
    good: "#3b82f6",
    neutral: "#737373",
    bad: "#f97316",
    awful: "#ef4444",
};

export default function StatsPage() {
  const year = new Date().getFullYear();
  const { data: yearlyStats, isLoading } = api.journal.getYearlyStats.useQuery({ year });

  if (isLoading) return <div className="p-8">Loading stats...</div>;

  // Transform Data
  const trendData = yearlyStats?.map(log => ({
      date: format(log.date, "MMM dd"),
      score: log.productivityScore || 0,
      mood: log.mood || "neutral"
  })) || [];

  // Calculate Aggregates
  const totalDays = trendData.length;
  const avgScore = totalDays > 0 ? (trendData.reduce((acc, curr) => acc + curr.score, 0) / totalDays).toFixed(1) : "0";

  // Mood Distribution
  const moodCounts = trendData.reduce((acc, curr) => {
      acc[curr.mood] = (acc[curr.mood] || 0) + 1;
      return acc;
  }, {} as Record<string, number>);

  const moodData = Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood,
      count,
      color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || "#fff"
  }));

  // Simple Streak Logic (consecutive days with logs)
  // Assumes sorted by date from backend? Usually Prisma returns unpredictable unless ordered.
  // We should verify order or sort here.
  const sortedStats = [...(yearlyStats || [])].sort((a, b) => a.date.getTime() - b.date.getTime());
  let currentStreak = 0;
  let maxStreak = 0;
  let prevDate: Date | null = null;

  sortedStats.forEach(stat => {
      if (!prevDate) {
          currentStreak = 1;
      } else {
          const diff = (stat.date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          if (Math.abs(diff - 1) < 0.1) { // roughly 1 day
              currentStreak++;
          } else {
              currentStreak = 1;
          }
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      prevDate = stat.date;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <Breadcrumbs />

      <div className="flex flex-col gap-2">
         <h1 className="text-3xl font-bold tracking-tight">Life Stats {year}</h1>
         <p className="text-muted-foreground">Your year in numbers.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{totalDays}</div>
                  <p className="text-xs text-muted-foreground">Days tracked this year</p>
              </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Productivity</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{avgScore}</div>
                  <p className="text-xs text-muted-foreground">Out of 10.0</p>
              </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{maxStreak}</div>
                  <p className="text-xs text-muted-foreground">Consecutive days</p>
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <Card className="bg-card border-border shadow-sm col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Productivity Trend</CardTitle>
            <CardDescription>Daily productivity scores over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
                <Tooltip
                    contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "8px" }}
                    labelStyle={{ color: "#a3a3a3" }}
                />
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card className="bg-card border-border shadow-sm col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Mood Distribution</CardTitle>
            <CardDescription>Frequency of logs by mood</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip
                         cursor={{fill: 'transparent'}}
                         contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                        {moodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
