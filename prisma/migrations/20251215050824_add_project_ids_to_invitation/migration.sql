-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "projectIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
