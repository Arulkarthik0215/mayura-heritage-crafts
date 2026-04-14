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
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-cream mb-4">About Us</h1>
          <p className="text-cream/80 text-lg max-w-2xl mx-auto">
            Where Heritage Becomes a Living Experience.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Story */}
    <section className="section-padding">
      <div className="container-custom max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            You've searched for idols and décor that carry true heritage, depth, and devotion — yet most often, what you find feels mass-produced and disconnected from tradition.
          </p>
          <p className="text-foreground text-xl font-medium leading-relaxed mb-6">
            That gap is why Mayura Heritage Crafts exists.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            I'm B. Sathya Bama — a passionate curator of sculptures, Golu traditions, and cultural storytelling. Every piece we bring to you reflects the richness of Indian heritage, crafted with care, meaning, and authenticity.
          </p>

          <div className="text-muted-foreground text-lg leading-relaxed mb-6">
            <p className="mb-3">At Mayura Heritage Crafts, we provide:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Distinctive Golu dolls inspired by mythology and tradition</li>
              <li>Finely crafted idols and brass artifacts</li>
              <li>Elegant spiritual décor and heritage gifts</li>
            </ul>
          </div>

          <p className="text-foreground text-xl font-medium leading-relaxed mb-6">
            We go beyond products — we bring stories, devotion, and culture into your spaces.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            With a vision to take our traditions beyond boundaries, we also enable global access to heritage collections and explore digital showcases of Golu, blending tradition with modern experience.
          </p>
          <p className="text-foreground text-lg font-medium italic leading-relaxed mb-10">
            Because heritage is not just to be preserved — it is to be experienced.
          </p>
        </motion.div>

        {/* Image */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10">
          <img src={categoryGolu} alt="Golu dolls" loading="lazy" className="w-full rounded-2xl shadow-lg" />
        </motion.div>

        {/* Founder */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="border-t border-border pt-8 mb-16">
          <p className="text-foreground font-serif text-xl">— Sathya Bama Karthikeyan</p>
          <p className="text-muted-foreground">Founder, Mayura Heritage Crafts</p>
        </motion.div>

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
      </div>
    </section>
  </div>
);

export default AboutPage;
