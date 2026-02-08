"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

const quotes = [
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "If you are not paying for it, you're not the customer; you're the product being sold.", author: "Andrew Lewis" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Do not wait; the time will never be 'just right'. Start where you stand.", author: "Napoleon Hill" },
  { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
];

export function DailyQuote() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  useEffect(() => {
    // Simple pseudo-random quote based on date so it persists for the day
    const index = new Date().getDate() % quotes.length;
    setQuote(quotes[index] || quotes[0]!);
  }, []);

  if (!quote) return null;

  return (
    <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-lg border text-sm text-muted-foreground italic mb-4">
      <Quote className="h-4 w-4 shrink-0 mt-0.5" />
      <div>
        <p>"{quote.text}"</p>
        <span className="block mt-1 text-xs not-italic font-semibold">— {quote.author}</span>
      </div>
    </div>
  );
}
