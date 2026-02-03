"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Card className="max-w-md border-destructive/50 bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
             <AlertCircle className="h-5 w-5" />
             Something went wrong!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => reset()} variant="destructive">
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
