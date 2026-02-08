import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  try {
    const user = await api.user.getPublicProfile({ username });

    return (
      <div className="container flex flex-col items-center justify-center min-h-screen py-10 gap-8">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="text-2xl">
                {user.name?.slice(0, 2).toUpperCase() || "CN"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              This is a public profile on Chronos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
