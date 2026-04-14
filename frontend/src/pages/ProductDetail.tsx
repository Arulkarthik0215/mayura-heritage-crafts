import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
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
    setShowModal(true);
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
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="aspect-[4/5] rounded-xl overflow-hidden bg-secondary">
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
              <span className="text-sm font-semibold tracking-widest uppercase text-primary bg-primary/10 px-4 py-1.5 rounded-full">Launching soon</span>
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
    </div>
  );
};

export default ProductDetail;
