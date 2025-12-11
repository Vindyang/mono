/*
  Warnings:

  - The primary key for the `activity_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `activity_log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `taskId` column on the `activity_log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `attachment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `attachment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `invitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `invitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `project_member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `project_member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `task_assignee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `task_assignee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `workspace` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `workspace_member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `workspace_member` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `taskId` on the `attachment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskId` on the `comment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workspaceId` on the `invitation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workspaceId` on the `project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `project_member` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workspaceMemberId` on the `project_member` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `projectId` on the `task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskId` on the `task_assignee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workspaceId` on the `workspace_member` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "activity_log" DROP CONSTRAINT "activity_log_taskId_fkey";

-- DropForeignKey
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_taskId_fkey";

-- DropForeignKey
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "project_member" DROP CONSTRAINT "project_member_projectId_fkey";

-- DropForeignKey
ALTER TABLE "project_member" DROP CONSTRAINT "project_member_workspaceMemberId_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "task_assignee" DROP CONSTRAINT "task_assignee_taskId_fkey";

-- DropForeignKey
ALTER TABLE "workspace_member" DROP CONSTRAINT "workspace_member_workspaceId_fkey";

-- AlterTable
ALTER TABLE "activity_log" DROP CONSTRAINT "activity_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER,
ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "attachment" DROP CONSTRAINT "attachment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL,
ADD CONSTRAINT "attachment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "comment" DROP CONSTRAINT "comment_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL,
ADD CONSTRAINT "comment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "workspaceId",
ADD COLUMN     "workspaceId" INTEGER NOT NULL,
ADD CONSTRAINT "invitation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "project" DROP CONSTRAINT "project_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "workspaceId",
ADD COLUMN     "workspaceId" INTEGER NOT NULL,
ADD CONSTRAINT "project_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "project_member" DROP CONSTRAINT "project_member_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
DROP COLUMN "workspaceMemberId",
ADD COLUMN     "workspaceMemberId" INTEGER NOT NULL,
ADD CONSTRAINT "project_member_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "task" DROP CONSTRAINT "task_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD CONSTRAINT "task_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "task_assignee" DROP CONSTRAINT "task_assignee_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL,
ADD CONSTRAINT "task_assignee_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "workspace_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workspace_member" DROP CONSTRAINT "workspace_member_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "workspaceId",
ADD COLUMN     "workspaceId" INTEGER NOT NULL,
ADD CONSTRAINT "workspace_member_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "activity_log_taskId_idx" ON "activity_log"("taskId");

-- CreateIndex
CREATE INDEX "attachment_taskId_idx" ON "attachment"("taskId");

-- CreateIndex
CREATE INDEX "comment_taskId_idx" ON "comment"("taskId");

-- CreateIndex
CREATE INDEX "comment_taskId_createdAt_idx" ON "comment"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "invitation_workspaceId_idx" ON "invitation"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_workspaceId_email_key" ON "invitation"("workspaceId", "email");

-- CreateIndex
CREATE INDEX "project_workspaceId_idx" ON "project"("workspaceId");

-- CreateIndex
CREATE INDEX "project_workspaceId_status_idx" ON "project"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "project_member_projectId_idx" ON "project_member"("projectId");

-- CreateIndex
CREATE INDEX "project_member_workspaceMemberId_idx" ON "project_member"("workspaceMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "project_member_projectId_workspaceMemberId_key" ON "project_member"("projectId", "workspaceMemberId");

-- CreateIndex
CREATE INDEX "task_projectId_idx" ON "task"("projectId");

-- CreateIndex
CREATE INDEX "task_projectId_status_idx" ON "task"("projectId", "status");

-- CreateIndex
CREATE INDEX "task_projectId_status_position_idx" ON "task"("projectId", "status", "position");

-- CreateIndex
CREATE INDEX "task_assignee_taskId_idx" ON "task_assignee"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "task_assignee_taskId_userId_key" ON "task_assignee"("taskId", "userId");

-- CreateIndex
CREATE INDEX "workspace_member_workspaceId_idx" ON "workspace_member"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_member_workspaceId_role_idx" ON "workspace_member"("workspaceId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_member_workspaceId_userId_key" ON "workspace_member"("workspaceId", "userId");

-- AddForeignKey
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_workspaceMemberId_fkey" FOREIGN KEY ("workspaceMemberId") REFERENCES "workspace_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignee" ADD CONSTRAINT "task_assignee_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
