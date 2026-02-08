import Link from "next/link";
import { ArrowRight, CheckCircle2, Layout, Lock, Zap } from "lucide-react";
import { getServerAuthSession } from "@/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <span className="hidden font-bold sm:inline-block">Chronos</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2"
                >
                  Get Started
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Master your time, <br className="hidden sm:inline" />
              unleash your potential.
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Chronos is the all-in-one productivity suite for high performers.
              Journal, track goals, and manage your schedule in one unified interface.
            </p>
            <div className="space-x-4">
              <Link
                href={session ? "/dashboard" : "/api/auth/signin"}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-11 px-8"
              >
                Start for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            {!session && (
              <p className="text-sm text-muted-foreground">
                No account required to try the demo. Sign in with any email (e.g. guest@chronos.app).
              </p>
            )}
          </div>
        </section>
        <section
          id="features"
          className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to stay organized and focused.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Layout className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Unified Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Your journal and timeline side-by-side for perfect context.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Zap className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Focus Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Eliminate distractions with a single click.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <CheckCircle2 className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Goal Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Break down big ambitions into manageable tasks.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Lock className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Privacy First</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is yours. Public profiles are opt-in only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Chronos.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <Link href="/about" className="hover:underline">About</Link>
             <Link href="https://github.com" target="_blank" className="hover:underline">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
