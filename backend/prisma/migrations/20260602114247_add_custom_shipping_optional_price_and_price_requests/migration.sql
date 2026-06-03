-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hasCustomShipping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shippingChargeForeign" DOUBLE PRECISION,
ADD COLUMN     "shippingChargeIndia" DOUBLE PRECISION,
ALTER COLUMN "price" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PriceRequest" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceRequest_pkey" PRIMARY KEY ("id")
);
