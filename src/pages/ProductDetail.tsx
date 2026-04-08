import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="section-padding text-center container-custom">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Product Not Found</h1>
        <Link to="/products" className="text-primary hover:underline">← Back to Products</Link>
      </div>
    );
  }

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Breadcrumb */}
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="aspect-square rounded-xl overflow-hidden bg-secondary">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-serif font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="text-sm font-medium text-primary">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-lg font-medium text-lg hover:bg-terracotta-dark transition-colors mb-8"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders above ₹999" },
                { icon: Shield, label: "Secure Payment", sub: "100% protected" },
                { icon: RotateCcw, label: "Easy Returns", sub: "7-day returns" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
