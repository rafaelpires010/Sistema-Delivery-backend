-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_id_user_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "id_user" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
