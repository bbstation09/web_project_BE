/*
  Warnings:

  - You are about to drop the `GroupLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostLike` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupLike" DROP CONSTRAINT "GroupLike_groupId_fkey";

-- DropForeignKey
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_postId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "badgeCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "GroupLike";

-- DropTable
DROP TABLE "PostLike";
