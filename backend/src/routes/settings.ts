import { Router } from "express";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authMiddleware } from "../middleware/auth";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/mayura_heritage?schema=public";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const router = Router();

// Get settings (public)
router.get("/", async (req, res) => {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    
    // Seed default if not exists
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "default",
          siteName: "Mayura Heritage Crafts",
          tagline: "Where Heritage Becomes a Living Experience.",
          contactEmail: "sbecetce@gmail.com",
          contactPhone: "+91 98433 94792",
          contactAddress: "Ohm illam, Plot No: 9/1 & 9/2, Arjuna Street, Opp. To Saibaba Temple, Thanathavam Main Road, Rajam Nagar, Ponmeni, Madurai 625016",
          heroTitle: "Sacred Artistry for Your Home",
          heroSubtitle: "Discover authentic Golu dolls, divine sculptures, and spiritual decor — each piece handcrafted by master artisans.",
          homeAboutTitle: "Our Heritage",
          homeAboutSubtitle: "Preserving Centuries of Sacred Art",
          homeAboutText1: "For over three generations, our family of artisans has been keeping alive the sacred tradition of Golu doll making. Each piece is hand-sculpted, painted with natural pigments, and blessed before it leaves our workshop.",
          homeAboutText2: "From the intricate details of a deity's ornaments to the vibrant colors that bring each character to life, our craftsmen pour their heart and soul into every creation.",
          aboutPageText: "You've searched for idols and décor that carry true heritage, depth, and devotion — yet most often, what you find feels mass-produced and disconnected from tradition.\n\nThat gap is why Mayura Heritage Crafts exists.\n\nI'm B. Sathya Bama — a passionate curator of sculptures, Golu traditions, and cultural storytelling. Every piece we bring to you reflects the richness of Indian heritage, crafted with care, meaning, and authenticity.\n\nAt Mayura Heritage Crafts, we provide:\n- Distinctive Golu dolls inspired by mythology and tradition\n- Finely crafted idols and brass artifacts\n- Elegant spiritual décor and heritage gifts\n\nWe go beyond products — we bring stories, devotion, and culture into your spaces.\n\nWith a vision to take our traditions beyond boundaries, we also enable global access to heritage collections and explore digital showcases of Golu, blending tradition with modern experience.\n\nBecause heritage is not just to be preserved — it is to be experienced.",
        },
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update settings (admin only)
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { 
      siteName, tagline, contactEmail, contactPhone, contactAddress, heroTitle, heroSubtitle,
      homeAboutTitle, homeAboutSubtitle, homeAboutText1, homeAboutText2, aboutPageText 
    } = req.body;
    
    const updatedSettings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        siteName,
        tagline,
        contactEmail,
        contactPhone,
        contactAddress,
        heroTitle,
        heroSubtitle,
        homeAboutTitle,
        homeAboutSubtitle,
        homeAboutText1,
        homeAboutText2,
        aboutPageText,
      },
      create: {
        id: "default",
        siteName,
        tagline,
        contactEmail,
        contactPhone,
        contactAddress,
        heroTitle,
        heroSubtitle,
        homeAboutTitle,
        homeAboutSubtitle,
        homeAboutText1,
        homeAboutText2,
        aboutPageText,
      },
    });
    
    res.json(updatedSettings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
