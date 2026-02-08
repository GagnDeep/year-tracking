"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Clock, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Clock className="h-6 w-6 text-primary" />
          <span>Chronos</span>
        </div>
        <nav className="ml-auto flex gap-4">
          <Link href="/api/auth/signin" className="text-sm font-medium hover:underline">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 flex flex-col items-center text-center gap-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight"
          >
            Master Your Time, <br />
            <span className="text-primary">Conquer Your Goals.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl"
          >
            Chronos is the ultimate daily planner that combines tasks, journaling,
            and goal tracking into a single, focus-driven workspace.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button size="lg" asChild className="h-12 px-8 text-lg">
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </section>

        <section className="bg-muted/50 py-24">
          <div className="container mx-auto px-6 grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-background border shadow-sm">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Task Management</h3>
              <p className="text-muted-foreground">
                Drag, drop, and prioritize your daily tasks with ease. Feel the
                satisfaction of completion.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-background border shadow-sm">
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold">Focus Mode</h3>
              <p className="text-muted-foreground">
                Eliminate distractions with a dedicated focus interface that puts
                your work front and center.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-background border shadow-sm">
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">Daily Journal</h3>
              <p className="text-muted-foreground">
                Reflect on your progress and capture thoughts directly alongside
                your tasks.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Chronos. Built with the T3 Stack.</p>
      </footer>
    </div>
  );
}
