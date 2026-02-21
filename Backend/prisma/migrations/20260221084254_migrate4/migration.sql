/*
  Warnings:

  - You are about to drop the column `name` on the `vehicles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[model]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "vehicles_name_key";

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "name";

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_model_key" ON "vehicles"("model");
