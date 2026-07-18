-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "token" UUID NOT NULL DEFAULT gen_random_uuid();

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_key" ON "invitation"("token");

