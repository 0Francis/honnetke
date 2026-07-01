/*
  Warnings:

  - The values [confirmed,declined] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [listing_review] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `listing_id` on the `analytics` table. All the data in the column will be lost.
  - You are about to drop the column `listing_id` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `listing_id` on the `favourites` table. All the data in the column will be lost.
  - You are about to drop the column `listing_id` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the `listing_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `listings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[property_id,week_start]` on the table `analytics` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id,property_id]` on the table `favourites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `property_id` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `property_id` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `property_id` to the `favourites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `property_id` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `reason` on the `reports` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('draft', 'pending_approval', 'active', 'fully_occupied', 'suspended', 'rejected', 'archived');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('hostel_room', 'shared_room', 'studio', 'bedsitter', 'sq', 'one_bedroom', 'two_bedroom', 'three_bedroom', 'suite', 'apartment', 'maisonette', 'other');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('spam', 'fraud', 'wrong_information', 'already_occupied', 'inappropriate', 'other');

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'visited', 'completed');
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('property_review', 'booking_update', 'visit_invitation', 'warning', 'suspension', 'announcement', 'report', 'system');
ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'system';
COMMIT;

-- AlterEnum
ALTER TYPE "ReportStatus" ADD VALUE 'dismissed';

-- DropForeignKey
ALTER TABLE "analytics" DROP CONSTRAINT "analytics_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "favourites" DROP CONSTRAINT "favourites_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "listing_images" DROP CONSTRAINT "listing_images_listing_id_fkey";

-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "listings" DROP CONSTRAINT "listings_landlord_id_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_listing_id_fkey";

-- DropIndex
DROP INDEX "analytics_listing_id_week_start_key";

-- DropIndex
DROP INDEX "bookings_student_id_listing_id_key";

-- DropIndex
DROP INDEX "favourites_student_id_listing_id_key";

-- AlterTable
ALTER TABLE "analytics" DROP COLUMN "listing_id",
ADD COLUMN     "property_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "listing_id",
ADD COLUMN     "map_link" VARCHAR(500),
ADD COLUMN     "meeting_point" VARCHAR(255),
ADD COLUMN     "property_id" INTEGER NOT NULL,
ADD COLUMN     "visit_date" TIMESTAMP(3),
ADD COLUMN     "visit_notes" TEXT,
ADD COLUMN     "visit_time" VARCHAR(20);

-- AlterTable
ALTER TABLE "favourites" DROP COLUMN "listing_id",
ADD COLUMN     "property_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "listing_id",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "property_id" INTEGER NOT NULL,
DROP COLUMN "reason",
ADD COLUMN     "reason" "ReportReason" NOT NULL;

-- DropTable
DROP TABLE "listing_images";

-- DropTable
DROP TABLE "listings";

-- DropEnum
DROP TYPE "ListingStatus";

-- CreateTable
CREATE TABLE "properties" (
    "property_id" SERIAL NOT NULL,
    "landlord_id" INTEGER,
    "agent_id" INTEGER,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "property_type" "PropertyType" NOT NULL DEFAULT 'other',
    "price" DECIMAL(10,2) NOT NULL,
    "deposit" DECIMAL(10,2),
    "gender_preference" "GenderPreference",
    "room_type" "RoomType",
    "amenities" TEXT[],
    "rules" TEXT[],
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "county" VARCHAR(100) NOT NULL,
    "area" VARCHAR(100) NOT NULL,
    "estate" VARCHAR(100),
    "nearest_campus" VARCHAR(150),
    "address" VARCHAR(255),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "map_link" VARCHAR(500),
    "status" "PropertyStatus" NOT NULL DEFAULT 'draft',
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("property_id")
);

-- CreateTable
CREATE TABLE "property_images" (
    "image_id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "view_history" (
    "view_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "property_id" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "view_history_pkey" PRIMARY KEY ("view_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "view_history_student_id_property_id_key" ON "view_history"("student_id", "property_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_property_id_week_start_key" ON "analytics"("property_id", "week_start");

-- CreateIndex
CREATE UNIQUE INDEX "favourites_student_id_property_id_key" ON "favourites"("student_id", "property_id");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "landlords"("landlord_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("agent_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "admins"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("property_id") ON DELETE CASCADE ON UPDATE CASCADE;
