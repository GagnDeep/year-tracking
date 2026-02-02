import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { format, eachDayOfInterval, startOfYear, endOfYear, isSameDay, isBefore } from "date-fns";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Year Progress | Chronos`,
    description: `See how ${username} is tracking their year on Chronos.`,
    openGraph: {
      images: [`/api/og?username=${username}`],
    },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  try {
    const profile = await api.public.getProfile({ username });
    const logs = await api.public.getYear({ username, year: new Date().getFullYear() });

    const now = new Date();
    const start = startOfYear(now);
    const end = endOfYear(now);
    const days = eachDayOfInterval({ start, end });

    // Map logs
    const statsMap = new Map();
    logs.forEach((log) => {
      statsMap.set(format(log.date, "yyyy-MM-dd"), log.productivityScore ?? 0);
    });

    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold">{profile.name}&apos;s {now.getFullYear()}</h1>
            <p className="text-neutral-400">Tracking progress publicly via Chronos.</p>
          </div>

          <div className="flex flex-wrap gap-1 justify-center">
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isToday = isSameDay(day, now);
              const isPast = isBefore(day, now) && !isToday;
              const score = statsMap.get(dateStr);

              let bgClass = "bg-neutral-900 border-neutral-800";

              if (isToday) {
                  bgClass = "bg-white animate-pulse border-white";
              } else if (isPast) {
                  if (score !== undefined) {
                      if (score >= 8) bgClass = "bg-emerald-500 border-emerald-500";
                      else if (score >= 4) bgClass = "bg-blue-500 border-blue-500";
                      else bgClass = "bg-orange-500 border-orange-500";
                  } else {
                      bgClass = "bg-neutral-800 border-neutral-800";
                  }
              }

              return (
                <div
                  key={dateStr}
                  title={dateStr}
                  className={`h-3 w-3 rounded-sm border ${bgClass}`}
                />
              );
            })}
          </div>

          <footer className="text-center text-sm text-neutral-600 pt-12">
            Made with <a href="/" className="underline hover:text-white">Chronos</a>
          </footer>
        </div>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
