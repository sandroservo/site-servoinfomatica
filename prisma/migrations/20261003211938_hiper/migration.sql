-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "hiperId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "hiperError" TEXT,
ADD COLUMN     "hiperOrderId" TEXT,
ADD COLUMN     "hiperSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hiperCode" INTEGER,
ADD COLUMN     "hiperId" TEXT,
ADD COLUMN     "hiperSyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Category_hiperId_key" ON "Category"("hiperId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_hiperId_key" ON "Product"("hiperId");

