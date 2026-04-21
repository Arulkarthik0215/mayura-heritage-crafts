import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mayura_heritage?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Migrating "sculptures" → "idols"...');

  // 1. Update all products with category "sculptures" to "idols"
  const updatedProducts = await prisma.product.updateMany({
    where: { category: 'sculptures' },
    data: { category: 'idols' },
  });
  console.log(`✅ Updated ${updatedProducts.count} product(s) from "sculptures" → "idols"`);

  // 2. Check if "sculptures" category exists
  const sculpturesCat = await prisma.category.findUnique({ where: { slug: 'sculptures' } });
  if (sculpturesCat) {
    // Check if "idols" category already exists
    const idolsCat = await prisma.category.findUnique({ where: { slug: 'idols' } });
    if (idolsCat) {
      // "idols" already exists, just delete the old "sculptures" one
      await prisma.category.delete({ where: { slug: 'sculptures' } });
      console.log('✅ Deleted old "sculptures" category (idols already exists)');
    } else {
      // Update the slug from "sculptures" to "idols"
      await prisma.category.update({
        where: { slug: 'sculptures' },
        data: {
          slug: 'idols',
          name: 'Idols',
          description: 'Finely crafted divine idols',
        },
      });
      console.log('✅ Updated category slug "sculptures" → "idols"');
    }
  } else {
    console.log('ℹ️  No "sculptures" category found — may already be migrated');
    // Ensure "idols" category exists
    const idolsCat = await prisma.category.findUnique({ where: { slug: 'idols' } });
    if (!idolsCat) {
      await prisma.category.create({
        data: {
          slug: 'idols',
          name: 'Idols',
          description: 'Finely crafted divine idols',
          icon: '🕉️',
        },
      });
      console.log('✅ Created "idols" category');
    } else {
      console.log('ℹ️  "idols" category already exists');
    }
  }

  console.log('🎉 Migration complete!');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
