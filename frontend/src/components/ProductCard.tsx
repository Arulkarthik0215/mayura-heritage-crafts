import { Link } from "react-router-dom";
import { ShoppingCart, Star, Check } from "lucide-react";
import { Product } from "@/data/products";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-500" />
        <span><b>{product.name}</b> added to cart</span>
      </div>
    );
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
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                <span className="text-xs text-muted-foreground">
                  {product.rating ? Number(product.rating).toFixed(1) : "0.0"} ({product.reviews || 0})
                </span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.inStock ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                )}
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
    </motion.div>
  );
};

export default ProductCard;
