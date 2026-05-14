"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { data: user, isLoading, refetch } = api.auth.getProfile.useQuery();
  const updateProfile = api.auth.updateProfile.useMutation({
      onSuccess: () => {
          toast.success("Profile updated successfully");
          refetch();
      },
      onError: (err) => {
          toast.error(err.message);
      }
  });

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [image, setImage] = useState("");

  useEffect(() => {
    if (user) {
        setName(user.name ?? "");
        setUsername(user.username ?? "");
        setIsPublic(user.isPublic ?? false);
        setImage(user.image ?? "");
    }
  }, [user]);

  const handleSave = () => {
    updateProfile.mutate({
        name,
        username: username || null,
        isPublic,
        image: image || null
    });
  };

  const userInitials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your public profile and account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                  <AvatarImage src={image} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                  <Label htmlFor="image">Avatar URL</Label>
                  <Input
                      id="image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-muted-foreground">Link to an image file for your avatar.</p>
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
                <div className="flex items-center px-3 border border-input rounded-md bg-muted text-muted-foreground text-sm">
                    chronos.app/p/
                </div>
                <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                />
            </div>
            <p className="text-xs text-muted-foreground">Unique username for your public profile.</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-secondary/20">
            <div className="space-y-0.5">
              <Label className="text-base">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow anyone to view your year grid and stats (journal content remains private).
              </p>
            </div>
            <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6 flex justify-end">
             <Button onClick={handleSave} disabled={updateProfile.isPending}>
                 {updateProfile.isPending ? "Saving..." : "Save Changes"}
             </Button>
        </CardFooter>
      </Card>

      {isPublic && username && (
          <Card className="bg-emerald-950/20 border-emerald-900/50">
              <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm text-emerald-400">Your profile is live!</span>
                  <Button variant="link" asChild className="text-emerald-400 hover:text-emerald-300">
                      <a href={`/p/${username}`} target="_blank">View Profile &rarr;</a>
                  </Button>
              </CardContent>
          </Card>
      )}
    </div>
  );
}
