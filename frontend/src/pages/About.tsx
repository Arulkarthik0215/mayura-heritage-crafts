import { motion } from "framer-motion";
import aboutStory from "@/assets/about-story.jpg";
import categoryGolu from "@/assets/category-golu.jpg";

const AboutPage = () => (
  <div>
    {/* Hero */}
    <section className="relative py-20 md:py-32">
      <div className="absolute inset-0">
        <img src={aboutStory} alt="Artisan at work" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>
      <div className="container-custom relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-4">Our Story</h1>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto">
            Three generations of sacred artistry, keeping alive the traditions of Hindu craftsmanship.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Story */}
    <section className="section-padding">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="prose prose-lg mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div>
              <p className="text-primary font-medium text-sm tracking-widest uppercase mb-2">The Beginning</p>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Rooted in Tradition</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mayura Heritage Craft was born from a deep reverence for Hindu artistic traditions. What started as a small family workshop in Chennai has grown into a beloved destination for authentic sacred crafts. Our founder began learning the art of Golu doll making at the age of 12, apprenticing under master craftsmen in Thanjavur.
              </p>
            </div>
            <img src={categoryGolu} alt="Golu dolls" loading="lazy" className="rounded-xl" />
          </div>

          <div className="mb-16">
            <p className="text-primary font-medium text-sm tracking-widest uppercase mb-2">Cultural Significance</p>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">The Sacred Art of Golu</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Golu (also known as Kolu or Bommai Kolu) is a time-honored tradition during the Navaratri festival, where beautifully handcrafted dolls are arranged on tiered steps. This display represents the cosmic hierarchy and celebrates the triumph of good over evil.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each doll tells a story — from scenes of the divine court of gods and goddesses to depictions of daily village life. The tradition of making and displaying Golu is passed down through generations, connecting families to their cultural roots.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              At Mayura Heritage Craft, we take pride in creating each Golu doll with the same techniques and reverence that our ancestors used centuries ago, while also embracing contemporary designs that appeal to modern sensibilities.
            </p>
          </div>

          {/* Values */}
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { emoji: "🎨", title: "Artisan Made", desc: "Every piece is handcrafted by skilled artisans with generations of expertise." },
              { emoji: "🌿", title: "Natural Materials", desc: "We use natural pigments, sacred wood, and traditional materials." },
              { emoji: "🙏", title: "Blessed Creations", desc: "Each piece is ritually blessed before it reaches your home." },
            ].map((v) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center p-6 bg-secondary rounded-xl">
                <span className="text-3xl mb-3 block">{v.emoji}</span>
                <h3 className="font-serif font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default AboutPage;
