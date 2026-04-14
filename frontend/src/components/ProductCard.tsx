import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShoppingCart, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {product.tags.includes("bestseller") && (
              <span className="absolute top-3 right-3 bg-gold text-foreground text-xs font-semibold px-2 py-1 rounded">
                Bestseller
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
            <h3 className="font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mb-3">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviews})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">Launching soon</span>
              </div>
              <button
                onClick={handleAddToCart}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-terracotta-dark transition-colors"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground text-center">Launching Soon!</DialogTitle>
            <DialogDescription className="text-center pt-2 text-base text-muted-foreground">
              We're putting the finishing touches on our store. 
              <br/><br/>
              <b>{product.name}</b> will be available for purchase very soon. Stay tuned!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <button 
              onClick={() => setShowModal(false)}
              className="bg-primary text-primary-foreground px-8 py-2.5 rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
            >
              Got it
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProductCard;
