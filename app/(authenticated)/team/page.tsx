"use client";

import { MemberList } from "@/app/(authenticated)/team/components/member-list";

import { TeamStats } from "@/app/(authenticated)/team/components/team-stats";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getTeamData, TeamStatsData } from "./componentsaction/actions";
import { TeamMember } from "@/lib/types/team";
import { useState, useEffect } from "react";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStatsData>({
    totalMembers: 0,
    activeMembers: 0,
    pendingInvites: 0,
    newMembersLastMonth: 0
  });
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { members, stats, error } = await getTeamData();
        
        if (error) {
           toast.error(error);
           return;
        }

        if (members) setMembers(members);
        if (stats) setStats(stats);
      } catch (error) {
        console.error("Failed to fetch team data", error);
        toast.error("Failed to load team data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TeamStats 
        totalMembers={stats.totalMembers}
        activeMembers={stats.activeMembers}
        pendingInvites={stats.pendingInvites}
        newMembersLastMonth={stats.newMembersLastMonth}
      />

      <MemberList members={members} />
    </div>
  );
}
