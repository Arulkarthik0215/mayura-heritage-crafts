import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories, fetchTestimonials, fetchSettings } from "@/lib/api";
import { products as fallbackProducts, testimonials as fallbackTestimonials } from "@/data/products";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import heroImage from "@/assets/hero-golu.jpg";
import categoryGolu from "@/assets/category-golu.jpg";
import categoryIdols from "@/assets/category-sculptures.jpg";
import categoryDecor from "@/assets/category-decor.jpg";
import aboutStory from "@/assets/about-story-new.png";

const categoryImages: Record<string, string> = {
  golu: categoryGolu,
  idols: categoryIdols,
  sculptures: categoryIdols,
  decor: categoryDecor,
};

const fallbackCategoryData = [
  { id: "golu", name: "Golu Dolls", description: "Traditional Navaratri Golu sets" },
  { id: "idols", name: "Idols", description: "Finely crafted divine idols" },
  { id: "decor", name: "Spiritual Decor", description: "Elegant heritage décor pieces" },
];

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(fallbackCategoryData);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProducts().catch(() => null),
      fetchCategories().catch(() => null),
      fetchTestimonials().catch(() => null),
    ]).then(([prodRes, catRes, testRes]) => {
      // Products
      if (prodRes?.products?.length) {
        setFeaturedProducts(prodRes.products.filter((p: any) => p.featured));
      } else {
        setFeaturedProducts(fallbackProducts.filter((p) => p.featured));
      }

      // Categories
      if (catRes?.categories?.length) {
        setCategories(
          catRes.categories.map((c: any) => ({
            id: c.slug,
            name: c.name,
            description: c.description,
          }))
        );
      }

      // Testimonials
      if (testRes?.testimonials?.length) {
        setTestimonials(testRes.testimonials);
      } else {
        setTestimonials(fallbackTestimonials);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Traditional Navaratri Golu display" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <p className="text-gold font-medium text-sm tracking-widest uppercase mb-4">✦ Handcrafted with Devotion</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-cream leading-tight mb-6">
              {settings?.heroTitle || "Sacred Artistry for Your Home"}
            </h1>
            <p className="text-cream/80 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              {settings?.heroSubtitle || "Discover authentic Golu dolls, divine sculptures, and spiritual decor — each piece handcrafted by master artisans."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-cream/40 text-cream px-8 py-3.5 rounded-lg font-medium hover:bg-cream/10 transition-colors"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-primary font-medium text-sm tracking-widest uppercase mb-2">Browse by Category</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Our Collections</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {categories.slice(0, 3).map((cat, i) => (
                <CategoryCard key={cat.id} {...cat} image={categoryImages[cat.id] || categoryDecor} index={i} />
              ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-secondary/50">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex items-center justify-between mb-12">
            <div>
              <p className="text-primary font-medium text-sm tracking-widest uppercase mb-2">Curated for You</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Featured Products</h2>
            </div>
            <Link to="/products" className="hidden md:inline-flex items-center gap-2 text-primary font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {Array.from({ length: 4 }).map((_, i) => (
               <ProductSkeleton key={i} />
             ))}
           </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
          <div className="mt-8 text-center md:hidden">
            <Link to="/products" className="inline-flex items-center gap-2 text-primary font-medium">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <img src={aboutStory} alt="Artisan crafting" loading="lazy" width={1200} height={800} className="rounded-xl shadow-lg" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="text-primary font-medium text-sm tracking-widest uppercase mb-2">{settings?.homeAboutTitle || "Our Heritage"}</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                {settings?.homeAboutSubtitle || "Preserving Centuries of Sacred Art"}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {settings?.homeAboutText1 || "For over three generations, our family of artisans has been keeping alive the sacred tradition of Golu doll making. Each piece is hand-sculpted, painted with natural pigments, and blessed before it leaves our workshop."}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {settings?.homeAboutText2 || "From the intricate details of a deity's ornaments to the vibrant colors that bring each character to life, our craftsmen pour their heart and soul into every creation."}
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
              >
                Read Our Story <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section-padding bg-secondary/50">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <p className="text-primary font-medium text-sm tracking-widest uppercase mb-2">What Our Customers Say</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Loved by Thousands</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card p-6 rounded-xl border border-border"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AR/VR Coming Soon */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-warm-brown to-foreground p-10 md:p-16 text-center"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gold blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-primary blur-3xl" />
            </div>
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-gold mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-cream mb-4">
                Digital Products
              </h2>
              <p className="text-cream/70 max-w-lg mx-auto mb-6 leading-relaxed">
                Coming Soon — Explore our exclusive digital showcases of Golu, blending tradition with a modern digital experience.
              </p>
              <span className="inline-flex items-center gap-2 bg-gold/20 text-gold px-6 py-2.5 rounded-full text-sm font-medium">
                🚀 Coming Soon
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
