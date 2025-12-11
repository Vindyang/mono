import { PrismaClient } from "../generated/prisma/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dayjs from "dayjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // Users
  const users = [
    {
      id: "user_1",
      name: "Alex Johnson",
      email: "alex.j@example.com",
      emailVerified: true,
      image: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: "user_2",
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      emailVerified: true,
      image: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: "user_3",
      name: "Michael Chen",
      email: "michael.c@example.com",
      emailVerified: true,
      image: "https://i.pravatar.cc/150?u=3",
    },
    {
      id: "user_4",
      name: "Emily Davis",
      email: "emily.d@example.com",
      emailVerified: true,
      image: "https://i.pravatar.cc/150?u=4",
    },
    {
      id: "user_5",
      name: "David Wilson",
      email: "david.w@example.com",
      emailVerified: true,
      image: "https://i.pravatar.cc/150?u=5",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log(`✅ Seeded ${users.length} users`);

  // Workspace
  const workspaceData = {
    id: "workspace_1",
    name: "Default Workspace",
    slug: "default",
    description: "Your default workspace for task management",
  };

  const workspace = await prisma.workspace.upsert({
    where: { slug: workspaceData.slug },
    update: {},
    create: workspaceData,
  });
  console.log("✅ Seeded workspace");

  // Workspace Members
  const workspaceMembers = [
    {
      workspaceId: workspace.id,
      userId: "user_1",
      role: "OWNER" as const,
      status: "ACTIVE" as const,
      joinedAt: new Date("2023-01-15"),
    },
    {
      workspaceId: workspace.id,
      userId: "user_2",
      role: "ADMIN" as const,
      status: "ACTIVE" as const,
      joinedAt: new Date("2023-02-10"),
    },
    {
      workspaceId: workspace.id,
      userId: "user_3",
      role: "MEMBER" as const,
      status: "OFFLINE" as const,
      joinedAt: new Date("2023-03-22"),
    },
    {
      workspaceId: workspace.id,
      userId: "user_4",
      role: "MEMBER" as const,
      status: "BUSY" as const,
      joinedAt: new Date("2023-04-05"),
    },
    {
      workspaceId: workspace.id,
      userId: "user_5",
      role: "VIEWER" as const,
      status: "ACTIVE" as const,
      joinedAt: new Date("2023-05-18"),
    },
  ];

  for (const member of workspaceMembers) {
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: member.workspaceId,
          userId: member.userId,
        },
      },
      update: {
        role: member.role,
        status: member.status,
      },
      create: member,
    });
  }
  console.log(`✅ Seeded ${workspaceMembers.length} workspace members`);

  // Invitations
  const invitations = [
    {
      workspaceId: workspace.id,
      email: "jessica.lee@example.com",
      role: "MEMBER" as const,
      status: "PENDING" as const,
      invitedById: "user_1",
      invitedAt: dayjs().subtract(2, "day").toDate(),
      expiresAt: dayjs().add(5, "day").toDate(),
    },
    {
      workspaceId: workspace.id,
      email: "robert.brown@example.com",
      role: "VIEWER" as const,
      status: "PENDING" as const,
      invitedById: "user_2",
      invitedAt: dayjs().subtract(5, "hour").toDate(),
      expiresAt: dayjs().add(7, "day").toDate(),
    },
  ];

  for (const invitation of invitations) {
    await prisma.invitation.upsert({
      where: {
        workspaceId_email: {
          workspaceId: invitation.workspaceId,
          email: invitation.email,
        },
      },
      update: {
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
      create: invitation,
    });
  }
  console.log(`✅ Seeded ${invitations.length} invitations`);

  // Projects
  const projects = [
    {
      id: "proj_web",
      workspaceId: workspace.id,
      name: "Website Redesign",
      description:
        "Complete overhaul of the corporate website including new branding and improved UX.",
      color: "#3b82f6",
      dueDate: dayjs().add(2, "week").toDate(),
      status: "ACTIVE" as const,
    },
    {
      id: "proj_app",
      workspaceId: workspace.id,
      name: "Mobile App Launch",
      description:
        "Development and launch of the new iOS and Android mobile applications.",
      color: "#8b5cf6",
      dueDate: dayjs().add(1, "month").toDate(),
      status: "ACTIVE" as const,
    },
    {
      id: "proj_mkt",
      workspaceId: workspace.id,
      name: "Q4 Marketing Campaign",
      description:
        "Strategic marketing campaign for Q4 including social media, email, and ads.",
      color: "#10b981",
      dueDate: dayjs().add(3, "week").toDate(),
      status: "ACTIVE" as const,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        description: project.description,
        color: project.color,
        dueDate: project.dueDate,
        status: project.status,
      },
      create: project,
    });
  }
  console.log(`✅ Seeded ${projects.length} projects`);

  // Get workspace members for project assignments
  const allWorkspaceMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
  });

  const userToWorkspaceMember = Object.fromEntries(
    allWorkspaceMembers.map((wm) => [wm.userId, wm.id])
  );

  // Project Members
  const projectMembers = [
    // Website Redesign: user_1 (Lead), user_2, user_3
    {
      projectId: "proj_web",
      workspaceMemberId: userToWorkspaceMember["user_1"],
      role: "LEAD" as const,
    },
    {
      projectId: "proj_web",
      workspaceMemberId: userToWorkspaceMember["user_2"],
      role: "MEMBER" as const,
    },
    {
      projectId: "proj_web",
      workspaceMemberId: userToWorkspaceMember["user_3"],
      role: "MEMBER" as const,
    },
    // Mobile App Launch: user_1 (Lead), user_4
    {
      projectId: "proj_app",
      workspaceMemberId: userToWorkspaceMember["user_1"],
      role: "LEAD" as const,
    },
    {
      projectId: "proj_app",
      workspaceMemberId: userToWorkspaceMember["user_4"],
      role: "MEMBER" as const,
    },
    // Q4 Marketing Campaign: user_2 (Lead), user_5
    {
      projectId: "proj_mkt",
      workspaceMemberId: userToWorkspaceMember["user_2"],
      role: "LEAD" as const,
    },
    {
      projectId: "proj_mkt",
      workspaceMemberId: userToWorkspaceMember["user_5"],
      role: "VIEWER" as const,
    },
  ];

  for (const projectMember of projectMembers) {
    await prisma.projectMember.upsert({
      where: {
        projectId_workspaceMemberId: {
          projectId: projectMember.projectId,
          workspaceMemberId: projectMember.workspaceMemberId,
        },
      },
      update: {
        role: projectMember.role,
      },
      create: projectMember,
    });
  }
  console.log(`✅ Seeded ${projectMembers.length} project members`);

  // Tasks
  const tasks = [
    // Website Redesign Tasks
    {
      id: "task_1",
      projectId: "proj_web",
      createdById: "user_1",
      title: "Design System Audit",
      description: "Review current components and identify inconsistencies",
      status: "DONE" as const,
      priority: "HIGH" as const,
      dueDate: dayjs().toDate(),
      position: 0,
    },
    {
      id: "task_1b",
      projectId: "proj_web",
      createdById: "user_1",
      title: "Update Color Palette",
      description: "Refine primary and secondary colors for better contrast",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      dueDate: dayjs().toDate(),
      position: 1,
    },
    {
      id: "task_1c",
      projectId: "proj_web",
      createdById: "user_2",
      title: "Fix Navigation Bug",
      description: "Menu doesn't close on mobile click",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      dueDate: dayjs().toDate(),
      position: 0,
    },
    {
      id: "task_1d",
      projectId: "proj_web",
      createdById: "user_3",
      title: "Optimize Images",
      description: "Compress hero images for faster load time",
      status: "TODO" as const,
      priority: "LOW" as const,
      dueDate: dayjs().toDate(),
      position: 2,
    },
    {
      id: "task_2",
      projectId: "proj_web",
      createdById: "user_1",
      title: "Homepage Hero Section",
      description: "Design and implement the new hero section with 3D elements",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      dueDate: dayjs().add(1, "day").toDate(),
      position: 1,
    },
    // Mobile App Launch Tasks
    {
      id: "task_4",
      projectId: "proj_app",
      createdById: "user_4",
      title: "Push Notification Setup",
      description: "Configure Firebase Cloud Messaging for iOS and Android",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      dueDate: dayjs().toDate(),
      position: 0,
    },
    // Q4 Marketing Campaign Tasks
    {
      id: "task_7",
      projectId: "proj_mkt",
      createdById: "user_2",
      title: "Social Media Calendar",
      description: "Plan posts for Instagram, LinkedIn, and Twitter",
      status: "TODO" as const,
      priority: "MEDIUM" as const,
      dueDate: dayjs().add(3, "day").toDate(),
      position: 0,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        position: task.position,
      },
      create: task,
    });
  }
  console.log(`✅ Seeded ${tasks.length} tasks`);

  // Task Assignees
  const taskAssignees = [
    { taskId: "task_1", userId: "user_1" },
    { taskId: "task_1b", userId: "user_2" },
    { taskId: "task_1c", userId: "user_2" },
    { taskId: "task_1d", userId: "user_3" },
    { taskId: "task_2", userId: "user_1" },
    { taskId: "task_4", userId: "user_4" },
    { taskId: "task_7", userId: "user_2" },
  ];

  for (const assignee of taskAssignees) {
    await prisma.taskAssignee.upsert({
      where: {
        taskId_userId: {
          taskId: assignee.taskId,
          userId: assignee.userId,
        },
      },
      update: {},
      create: assignee,
    });
  }
  console.log(`✅ Seeded ${taskAssignees.length} task assignees`);

  console.log("\n🎉 Database seeding completed successfully!");
  console.log(`
  📊 Summary:
  - Workspaces: 1
  - Users: ${users.length}
  - Workspace Members: ${workspaceMembers.length}
  - Invitations: ${invitations.length}
  - Projects: ${projects.length}
  - Project Members: ${projectMembers.length}
  - Tasks: ${tasks.length}
  - Task Assignees: ${taskAssignees.length}
  `);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
