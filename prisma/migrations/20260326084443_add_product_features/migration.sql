-- AlterTable
ALTER TABLE "products" ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[];
