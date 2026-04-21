import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mayura_heritage?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // --- Seed Admin User ---
  const adminEmail = 'admin@mayura.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: 'admin123', // Plain text for MVP — replace with bcrypt hash later
        name: 'Mayura Admin',
        role: 'admin',
      },
    });
    console.log('✅ Admin user created: admin@mayura.com / admin123');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // --- Seed Categories ---
  const categories = [
    { slug: 'golu', name: 'Golu Dolls', description: 'Traditional Navaratri Golu sets', icon: '🪔' },
    { slug: 'idols', name: 'Idols', description: 'Finely crafted divine idols', icon: '🕉️' },
    { slug: 'decor', name: 'Spiritual Decor', description: 'Handmade spiritual home decor', icon: '🏵️' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  // --- Seed Products ---
  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    const products = [
      {
        name: 'Navaratri Golu Set - Royal Court',
        description: 'A stunning 15-piece Golu set depicting the royal Dasara court scene. Each doll is hand-painted with intricate details using natural pigments. Perfect centerpiece for your Navaratri celebrations.',
        price: 4999,
        originalPrice: 5999,
        category: 'golu',
        images: ['/placeholder.svg'],
        featured: true,
        rating: 4.8,
        reviews: 124,
        inStock: true,
        tags: ['bestseller', 'festive'],
      },
      {
        name: 'Golu Padi Set - 9 Steps Wooden',
        description: 'Traditional 9-step wooden Golu padi (steps) made from seasoned teak wood. Foldable design for easy storage. Hand-polished with natural oils.',
        price: 3499,
        category: 'golu',
        images: ['/placeholder.svg'],
        featured: true,
        rating: 4.6,
        reviews: 89,
        inStock: true,
        tags: ['popular'],
      },
      {
        name: 'Brass Ganesha Sculpture - 12 inch',
        description: 'Exquisitely crafted brass Lord Ganesha sculpture. Each piece is individually cast using the traditional lost-wax method. A timeless addition to your pooja room.',
        price: 7999,
        originalPrice: 9499,
        category: 'idols',
        images: ['/placeholder.svg'],
        featured: true,
        rating: 4.9,
        reviews: 203,
        inStock: true,
        tags: ['premium', 'bestseller'],
      },
      {
        name: 'Terracotta Lakshmi Devi',
        description: 'Hand-sculpted terracotta Goddess Lakshmi statue with gold leaf accents. Made by artisans from Thanjavur with generations of craft expertise.',
        price: 2999,
        category: 'idols',
        images: ['/placeholder.svg'],
        featured: false,
        rating: 4.7,
        reviews: 67,
        inStock: true,
        tags: ['artisan'],
      },
      {
        name: 'Brass Diya Set - Temple Collection',
        description: 'Set of 5 traditional brass diyas (oil lamps) inspired by South Indian temple designs. Each diya features intricate floral patterns.',
        price: 1499,
        category: 'decor',
        images: ['/placeholder.svg'],
        featured: true,
        rating: 4.5,
        reviews: 156,
        inStock: true,
        tags: ['festive', 'popular'],
      },
      {
        name: 'Kolam Welcome Mat - Handwoven',
        description: 'Beautifully handwoven welcome mat featuring traditional Kolam patterns. Made from natural coir fiber with vibrant, fade-resistant colors.',
        price: 899,
        category: 'decor',
        images: ['/placeholder.svg'],
        featured: false,
        rating: 4.3,
        reviews: 45,
        inStock: true,
        tags: ['new'],
      },
      {
        name: 'Marapachi Bommai Set - Classic',
        description: 'Traditional Marapachi dolls carved from sacred wood. This classic couple set is an essential part of South Indian weddings and Golu displays.',
        price: 1999,
        category: 'golu',
        images: ['/placeholder.svg'],
        featured: false,
        rating: 4.7,
        reviews: 98,
        inStock: true,
        tags: ['traditional'],
      },
      {
        name: 'Tanjore Painting Frame - Krishna',
        description: 'Authentic Tanjore painting of Lord Krishna with real gold foil work. Handcrafted by master artisans from Thanjavur using centuries-old techniques.',
        price: 12999,
        originalPrice: 15999,
        category: 'decor',
        images: ['/placeholder.svg'],
        featured: true,
        rating: 4.9,
        reviews: 34,
        inStock: true,
        tags: ['premium', 'art'],
      },
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
    }
    console.log('✅ Products seeded (8 items)');
  } else {
    console.log(`ℹ️  Products already exist (${existingProducts} items)`);
  }

  // --- Seed Testimonials ---
  const existingTestimonials = await prisma.testimonial.count();
  if (existingTestimonials === 0) {
    const testimonials = [
      { name: 'Priya Ramanathan', location: 'Chennai', text: 'The Golu set I ordered was absolutely stunning! Each doll was beautifully hand-painted. My family loved setting it up for Navaratri.', rating: 5 },
      { name: 'Lakshmi Venkatesh', location: 'Bangalore', text: 'Exceptional quality brass sculptures. The Ganesha statue is a masterpiece that now graces our pooja room. Highly recommended!', rating: 5 },
      { name: 'Meena Krishnan', location: 'Coimbatore', text: "I've been ordering from Mayura Heritage Craft for 3 years now. The quality and attention to detail is unmatched. Perfect for gifting too!", rating: 5 },
      { name: 'Ananya Sundaram', location: 'Hyderabad', text: 'The Tanjore painting exceeded my expectations. The gold foil work is exquisite and it arrived beautifully packaged.', rating: 5 },
    ];

    for (const testimonial of testimonials) {
      await prisma.testimonial.create({ data: testimonial });
    }
    console.log('✅ Testimonials seeded (4 items)');
  } else {
    console.log(`ℹ️  Testimonials already exist (${existingTestimonials} items)`);
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
