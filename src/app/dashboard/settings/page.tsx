"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ExternalLink, Download, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  username: z.string().min(3, "Username must be at least 3 characters."),
  image: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  publicVisibility: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { data: user, isLoading } = api.user.getProfile.useQuery();
  const utils = api.useUtils();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      username: "",
      image: "",
      publicVisibility: false,
    },
    mode: "onChange",
  });

  const generateAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    form.setValue("image", url, { shouldDirty: true });
  };

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        username: user.username ?? "",
        image: user.image ?? "",
        publicVisibility: user.publicVisibility ?? false,
      });
    }
  }, [user, form]);

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("Profile updated successfully.");
      await utils.user.getProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(data: ProfileFormValues) {
    updateProfile.mutate(data);
  }

  const handleExport = () => {
      // Mock export functionality
      const data = JSON.stringify(user, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chronos-data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Data exported successfully.");
  };

  const deleteAccount = api.user.deleteAccount.useMutation({
      onSuccess: () => {
          toast.success("Account deleted successfully.");
          signOut({ callbackUrl: "/" });
      },
      onError: (error) => {
          toast.error(error.message);
      }
  });

  const handleDeleteAccount = () => {
      deleteAccount.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="chronos_user" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name. It can be your real name or a
                  pseudonym.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed on your profile and in
                  emails.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <Button type="button" variant="outline" onClick={generateAvatar}>
                    Randomize
                  </Button>
                </div>
                <FormDescription>
                  Link to your profile picture.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="publicVisibility"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Public Profile</FormLabel>
                  <FormDescription>
                    Make your profile visible to everyone.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {user?.publicVisibility && user.username && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 border rounded-md bg-muted/20">
                  <span>Your public profile is live at:</span>
                  <Link href={`/u/${user.username}`} className="text-primary hover:underline flex items-center gap-1" target="_blank">
                      /u/{user.username} <ExternalLink className="h-3 w-3" />
                  </Link>
              </div>
          )}

          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Updating..." : "Update profile"}
          </Button>
        </form>
      </Form>

      <div className="border-t pt-8 space-y-4">
          <h3 className="text-lg font-medium">Data & Privacy</h3>
          <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">Download a copy of your personal data.</p>
                  </div>
                  <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" /> Export JSON
                  </Button>
              </div>

              <div className="flex items-center justify-between border border-destructive/50 rounded-lg p-4 bg-destructive/5">
                  <div>
                      <h4 className="font-medium text-destructive">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash className="h-4 w-4 mr-2" /> Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Account
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
          </div>
      </div>
    </div>
  );
}
