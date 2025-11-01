/*
  Warnings:

  - Added the required column `elect_price` to the `monthly_payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elevator_fee` to the `monthly_payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_price` to the `monthly_payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trash_fee` to the `monthly_payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `washing_machine_fee` to the `monthly_payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `water_price` to the `monthly_payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "monthly_payment" ADD COLUMN     "elect_price" DECIMAL(8,2) NOT NULL,
ADD COLUMN     "elevator_fee" DECIMAL(8,2) NOT NULL,
ADD COLUMN     "room_price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "trash_fee" DECIMAL(8,2) NOT NULL,
ADD COLUMN     "washing_machine_fee" DECIMAL(8,2) NOT NULL,
ADD COLUMN     "water_price" DECIMAL(8,2) NOT NULL;
