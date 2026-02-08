import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  if (!username) {
    notFound();
  }

  const user = await api.user.getPublicProfile({ username });

  if (!user) {
      notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? username} />
            <AvatarFallback className="text-4xl font-bold">
                {user.name ? user.name[0]?.toUpperCase() : username[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
        </Avatar>

        <h1 className="text-3xl font-bold">{user.name ?? username}</h1>
        <p className="text-muted-foreground">Public Profile</p>

        <div className="w-full max-w-2xl mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                    <p>Completed 5 tasks today.</p>
                </div>
                 <div className="p-4 border rounded-lg">
                    <p>Maintained a 3-day streak!</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
