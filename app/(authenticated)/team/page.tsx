import { MemberList } from "@/app/(authenticated)/team/components/member-list";

import { TeamStats } from "@/app/(authenticated)/team/components/team-stats";
import { INITIAL_TEAM_MEMBERS } from "@/lib/data";

export default function TeamPage() {
  return (
    <div className="space-y-6">

      <TeamStats 
        totalMembers={INITIAL_TEAM_MEMBERS.length}
        activeMembers={INITIAL_TEAM_MEMBERS.filter(m => m.status === 'active').length}
        pendingInvites={2} // mock pending count for now
      />

      <MemberList members={INITIAL_TEAM_MEMBERS} />
    </div>
  );
}
