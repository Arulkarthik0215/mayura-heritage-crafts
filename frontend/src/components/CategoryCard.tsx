import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  index?: number;
}

const CategoryCard = ({ id, name, description, image, index = 0 }: CategoryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15, duration: 0.5 }}
  >
    <Link
      to={`/products?category=${id}`}
      className="group relative block aspect-[4/5] rounded-xl overflow-hidden"
    >
      <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="font-serif text-2xl font-bold text-cream mb-1">{name}</h3>
        <p className="text-sm text-cream/80">{description}</p>
        <span className="inline-block mt-3 text-sm font-medium text-gold group-hover:translate-x-1 transition-transform">
          Explore →
        </span>
      </div>
    </Link>
  </motion.div>
);

export default CategoryCard;
