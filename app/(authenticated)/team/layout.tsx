"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const InviteModal = dynamic(
  () =>
    import("@/app/(authenticated)/team/components/invite-modal").then(
      (mod) => mod.InviteModal
    ),
  {
    ssr: false,
    loading: () => (
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        Invite Member
      </Button>
    ),
  }
);

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current tab based on pathname
  let currentTab = "members";
  if (pathname.includes("/invitations")) {
    currentTab = "invitations";
  } else if (pathname.includes("/roles")) {
    currentTab = "roles";
  }

  const handleTabChange = (value: string) => {
    switch (value) {
      case "members":
        router.push("/team");
        break;
      case "invitations":
        router.push("/team/invitations");
        break;
      case "roles":
        router.push("/team/roles");
        break;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members, permissions, and invitations.
          </p>
        </div>
        <InviteModal />
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-2">{children}</div>
    </div>
  );
}
