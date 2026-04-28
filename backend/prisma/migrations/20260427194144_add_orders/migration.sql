-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "siteName" TEXT NOT NULL DEFAULT 'Mayura Heritage Crafts',
    "tagline" TEXT NOT NULL DEFAULT 'Where Heritage Becomes a Living Experience.',
    "contactEmail" TEXT NOT NULL DEFAULT 'sbecetce@gmail.com',
    "contactPhone" TEXT NOT NULL DEFAULT '+91 98433 94792',
    "contactAddress" TEXT NOT NULL DEFAULT 'Ohm illam, Plot No: 9/1 & 9/2, Arjuna Street, Opp. To Saibaba Temple, Thanathavam Main Road, Rajam Nagar, Ponmeni, Madurai 625016',
    "heroTitle" TEXT NOT NULL DEFAULT 'Sacred Artistry for Your Home',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Discover authentic Golu dolls, divine sculptures, and spiritual decor — each piece handcrafted by master artisans.',
    "homeAboutTitle" TEXT NOT NULL DEFAULT 'Our Heritage',
    "homeAboutSubtitle" TEXT NOT NULL DEFAULT 'Preserving Centuries of Sacred Art',
    "homeAboutText1" TEXT NOT NULL DEFAULT 'For over three generations, our family of artisans has been keeping alive the sacred tradition of Golu doll making. Each piece is hand-sculpted, painted with natural pigments, and blessed before it leaves our workshop.',
    "homeAboutText2" TEXT NOT NULL DEFAULT 'From the intricate details of a deity''s ornaments to the vibrant colors that bring each character to life, our craftsmen pour their heart and soul into every creation.',
    "aboutPageText" TEXT NOT NULL DEFAULT 'You''ve searched for idols and décor that carry true heritage, depth, and devotion — yet most often, what you find feels mass-produced and disconnected from tradition.

That gap is why Mayura Heritage Crafts exists.

I''m B. Sathya Bama — a passionate curator of sculptures, Golu traditions, and cultural storytelling. Every piece we bring to you reflects the richness of Indian heritage, crafted with care, meaning, and authenticity.

At Mayura Heritage Crafts, we provide:
- Distinctive Golu dolls inspired by mythology and tradition
- Finely crafted idols and brass artifacts
- Elegant spiritual décor and heritage gifts

We go beyond products — we bring stories, devotion, and culture into your spaces.

With a vision to take our traditions beyond boundaries, we also enable global access to heritage collections and explore digital showcases of Golu, blending tradition with modern experience.

Because heritage is not just to be preserved — it is to be experienced.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "subtotal" INTEGER NOT NULL,
    "shippingCharge" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "paidAt" TIMESTAMP(3),
    "trackingNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productImage" TEXT,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpayOrderId_key" ON "Order"("razorpayOrderId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
