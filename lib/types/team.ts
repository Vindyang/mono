export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  avatarUrl: string;
  status: "active" | "offline" | "busy";
  joinedAt: string;
  projects?: { id: string, name: string }[]; // Array of Project details
}

export interface Invitation {
  id: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "pending" | "accepted" | "expired";
  invitedBy: string;
  invitedAt: string;
  projectIds?: string[]; // Optional project IDs to assign the invited member to
}
