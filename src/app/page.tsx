"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, BarChart3, Layout, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { YearGridSkeleton } from "@/components/skeletons/year-grid-skeleton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-white text-black p-1.5 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <span>Chronos</span>
          </div>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-white text-black hover:bg-neutral-200">
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-neutral-800/30 via-neutral-950/0 to-neutral-950/0" />

          <div className="container relative px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl space-y-6"
            >
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
                Your Life in Weeks.
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Visualize your time, track your progress, and master your days with the ultimate year-tracking dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" asChild className="h-12 px-8 text-lg bg-white text-black hover:bg-neutral-200 w-full sm:w-auto">
                  <Link href="/register">
                    Start Tracking <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-lg border-neutral-800 hover:bg-neutral-900 w-full sm:w-auto">
                   <Link href="/p/demo">View Demo</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="col-span-1 md:col-span-2 row-span-2 rounded-3xl border border-neutral-800 bg-neutral-900/50 p-8 flex flex-col justify-between overflow-hidden relative group"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10 space-y-2">
                 <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mb-4">
                    <Layout className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-2xl font-bold">The Year Grid</h3>
                 <p className="text-neutral-400 max-w-md">
                   Every day is a block. Fill your year with meaningful work and visualize your momentum at a glance.
                 </p>
               </div>
               <div className="relative z-10 mt-8 opacity-50 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105 transition-transform">
                   <YearGridSkeleton />
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-8 space-y-4 hover:border-neutral-700 transition-colors"
            >
               <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-xl font-bold">Time Blocking</h3>
               <p className="text-neutral-400 text-sm">
                 Plan your day down to the minute. Drag, drop, and categorize your focus time.
               </p>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-8 space-y-4 hover:border-neutral-700 transition-colors"
            >
               <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-xl font-bold">Deep Insights</h3>
               <p className="text-neutral-400 text-sm">
                 Analyze your productivity trends, mood patterns, and streak data.
               </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black py-12">
            <div className="container px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <Calendar className="w-5 h-5" />
                    <span>Chronos</span>
                </div>
                <p className="text-sm text-neutral-500">
                    &copy; {new Date().getFullYear()} Chronos Inc. All rights reserved.
                </p>
            </div>
        </footer>
      </main>
    </div>
  );
}
