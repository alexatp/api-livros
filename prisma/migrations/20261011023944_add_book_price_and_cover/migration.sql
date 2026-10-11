/*
  Warnings:

  - Added the required column `priceDigital` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePhysical` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "priceDigital" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "pricePhysical" DECIMAL(10,2) NOT NULL;
