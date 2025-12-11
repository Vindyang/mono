/*
  Warnings:

  - The `userId` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "userId",
ADD COLUMN     "userId" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_userId_key" ON "user"("userId");
