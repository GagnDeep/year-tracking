import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container max-w-2xl py-10 mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>
      <h1 className="text-4xl font-bold mb-4">About Chronos</h1>
      <div className="prose dark:prose-invert">
        <p className="lead">
          Chronos is an open-source productivity suite designed to help you master your time and potential.
        </p>
        <p>
          We believe that productivity tools should be simple, unified, and respect your privacy. That's why Chronos combines three essential tools into one interface:
        </p>
        <ul>
          <li><strong>Journaling:</strong> Capture your thoughts and reflections daily.</li>
          <li><strong>Goal Tracking:</strong> Set clear objectives and break them down into actionable tasks.</li>
          <li><strong>Time Blocking:</strong> Schedule your day effectively with a drag-and-drop timeline.</li>
        </ul>
        <h2>Privacy First</h2>
        <p>
          Chronos is built with privacy in mind. Your data is stored securely, and we provide tools for you to export or delete your data at any time. Public profiles are opt-in only.
        </p>
        <h2>Open Source</h2>
        <p>
          Chronos is built using the T3 Stack (Next.js, tRPC, Prisma, Tailwind).
        </p>
      </div>
    </div>
  );
}
