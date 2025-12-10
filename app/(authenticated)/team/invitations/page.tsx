import { InvitationsList } from "@/app/(authenticated)/team/components/invitations-list";

import { INITIAL_INVITATIONS } from "@/lib/data";

export default function InvitationsPage() {
  return (
    <div className="space-y-6">
      <InvitationsList invitations={INITIAL_INVITATIONS} />
    </div>
  );
}
