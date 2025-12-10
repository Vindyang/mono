export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  avatarUrl: string;
  status: "active" | "offline" | "busy";
  joinedAt: string;
  projects?: string[]; // Array of Project IDs
}

export interface Invitation {
  id: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
  status: "pending" | "accepted" | "expired";
  invitedBy: string;
  invitedAt: string;
}
