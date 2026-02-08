"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";

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
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const utils = api.useUtils();
  const { data: user, isLoading } = api.user.getProfile.useQuery();

  const updateProfile = api.user.updateProfile.useMutation({
      onSuccess: () => {
          utils.user.getProfile.invalidate();
          toast.success("Profile updated!");
      },
      onError: () => toast.error("Failed to update profile.")
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        username: "",
        email: "",
        bio: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
      if (user) {
          form.reset({
              username: user.name ?? "",
              email: user.email ?? "",
              bio: "", // Bio is not in schema yet, keeping placeholder
          });
      }
  }, [user, form]);

  function onSubmit(data: ProfileFormValues) {
    updateProfile.mutate({ name: data.username });
  }

  if (isLoading) {
      return (
          <div className="space-y-6 max-w-2xl">
              <Skeleton className="h-8 w-48" />
              <div className="space-y-8">
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6 max-w-2xl">
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
                  <Input placeholder="jules" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="m@example.com" {...field} disabled />
                </FormControl>
                <FormDescription>
                  Email cannot be changed directly here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Input placeholder="Tell us about yourself" {...field} />
                </FormControl>
                <FormDescription>
                  Max 160 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Updating..." : "Update profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
