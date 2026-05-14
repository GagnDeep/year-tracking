import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { format, eachDayOfInterval, startOfYear, endOfYear, isSameDay, isBefore } from "date-fns";
import { Metadata } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    let totalScore = 0;
    let logCount = 0;

    logs.forEach((log) => {
      statsMap.set(format(log.date, "yyyy-MM-dd"), log.productivityScore ?? 0);
      if (log.productivityScore) {
          totalScore += log.productivityScore;
          logCount++;
      }
    });

    const avgScore = logCount > 0 ? (totalScore / logCount).toFixed(1) : "0.0";

    const userInitials = profile.name
      ? profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : "U";

    return (
      <div className="min-h-screen bg-neutral-950 text-foreground flex flex-col items-center py-12 px-4 selection:bg-primary selection:text-primary-foreground">
        <div className="w-full max-w-5xl space-y-8 animate-in fade-in duration-700">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between border-b border-border pb-8">
              <div className="flex items-center gap-6">
                 <Avatar className="h-24 w-24 border-2 border-border shadow-xl">
                    <AvatarImage src={profile.image || ""} />
                    <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground">{userInitials}</AvatarFallback>
                 </Avatar>
                 <div className="space-y-1 text-center md:text-left">
                     <h1 className="text-4xl font-extrabold tracking-tight">{profile.name}</h1>
                     <p className="text-muted-foreground font-mono text-sm">@{profile.username}</p>
                     <div className="flex gap-2 pt-2 justify-center md:justify-start">
                         <Badge variant="secondary" className="font-mono">
                             <Calendar className="mr-1 h-3 w-3" /> {now.getFullYear()}
                         </Badge>
                     </div>
                 </div>
              </div>

              <div className="flex gap-4">
                  <Card className="bg-card/50 border-border">
                      <CardContent className="p-4 flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                              <Trophy className="h-5 w-5" />
                          </div>
                          <div>
                              <div className="text-2xl font-bold">{logs.length}</div>
                              <div className="text-xs text-muted-foreground">Days Logged</div>
                          </div>
                      </CardContent>
                  </Card>
                   <Card className="bg-card/50 border-border">
                      <CardContent className="p-4 flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                              <TrendingUp className="h-5 w-5" />
                          </div>
                          <div>
                              <div className="text-2xl font-bold">{avgScore}</div>
                              <div className="text-xs text-muted-foreground">Avg Score</div>
                          </div>
                      </CardContent>
                  </Card>
              </div>
          </div>

          {/* Grid */}
          <Card className="bg-card/30 border-border backdrop-blur-sm overflow-hidden">
             <CardContent className="p-8">
                 <div className="flex flex-wrap gap-1.5 justify-center">
                    {days.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isToday = isSameDay(day, now);
                    const isPast = isBefore(day, now) && !isToday;
                    const score = statsMap.get(dateStr);

                    let bgClass = "bg-secondary/20 border-transparent"; // Future

                    if (isToday) {
                        bgClass = "bg-primary border-primary ring-2 ring-primary/20 z-10 scale-125 shadow-lg shadow-primary/20 animate-pulse";
                    } else if (isPast) {
                        if (score !== undefined) {
                            if (score >= 8) bgClass = "bg-emerald-500/90 hover:bg-emerald-500";
                            else if (score >= 4) bgClass = "bg-blue-500/90 hover:bg-blue-500";
                            else bgClass = "bg-orange-500/90 hover:bg-orange-500";
                        } else {
                            bgClass = "bg-muted border-transparent opacity-50"; // Past no data
                        }
                    }

                    return (
                        <div
                        key={dateStr}
                        title={`${dateStr} ${score ? `- ${score}/10` : ''}`}
                        className={cn(
                            "h-3 w-3 sm:h-4 sm:w-4 rounded-sm border transition-all duration-300 hover:scale-125 hover:z-20",
                            bgClass
                        )}
                        />
                    );
                    })}
                </div>
                 <div className="flex justify-center gap-6 text-xs font-medium text-muted-foreground pt-8">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-orange-500/90 shadow-sm shadow-orange-500/20"></div>
                        <span>Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-blue-500/90 shadow-sm shadow-blue-500/20"></div>
                        <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500/90 shadow-sm shadow-emerald-500/20"></div>
                        <span>High</span>
                    </div>
                </div>
             </CardContent>
          </Card>

          <footer className="text-center text-sm text-muted-foreground pt-12 pb-8">
             <p>
                 Track your own year with <Link href="/" className="font-semibold text-foreground hover:underline">Chronos</Link>.
             </p>
          </footer>
        </div>
      </div>
    );
  } catch (e) {
    notFound();
  }
}
