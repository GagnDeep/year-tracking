"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!res?.error) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 via-background to-background opacity-50 z-0 pointer-events-none" />

      <div className="w-full max-w-md z-10 px-4">
        <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                    <Calendar className="w-6 h-6" />
                </div>
                <span>Chronos</span>
            </div>
        </div>

        <Card className="w-full bg-card border-border shadow-xl">
            <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your email to sign in to Chronos.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                </div>
                <div className="flex flex-col space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-input text-foreground"
                    />
                </div>
                </div>
                {error && <p className="text-destructive text-sm mt-4 font-medium">{error}</p>}
                <Button className="w-full mt-6 font-semibold" type="submit">Login</Button>
            </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
                Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium ml-1">Register</Link>
            </p>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
