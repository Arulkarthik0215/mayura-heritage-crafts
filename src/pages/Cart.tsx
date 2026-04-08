import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  if (items.length === 0) {
    return (
      <div className="section-padding text-center container-custom">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">Discover our beautiful collection of handcrafted spiritual art.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-terracotta-dark transition-colors">
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Shopping Cart ({items.length})</h1>

        <div className="space-y-4 mb-8">
          {items.map(({ product, quantity }) => (
            <motion.div key={product.id} layout className="flex gap-4 bg-card p-4 rounded-xl border border-border">
              <img src={product.images[0]} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <Link to={`/product/${product.id}`} className="font-serif font-semibold text-foreground hover:text-primary line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                <p className="font-serif font-bold text-foreground mt-1">{formatPrice(product.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeFromCart(product.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 border border-border rounded-lg">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="p-1.5 hover:bg-secondary rounded-l-lg">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="p-1.5 hover:bg-secondary rounded-r-lg">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card p-6 rounded-xl border border-border">
          <div className="flex justify-between items-center mb-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-serif font-bold text-lg text-foreground">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-sm text-primary font-medium">{totalPrice >= 999 ? "Free" : formatPrice(99)}</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="font-serif font-semibold text-foreground">Total</span>
            <span className="font-serif font-bold text-2xl text-foreground">
              {formatPrice(totalPrice + (totalPrice >= 999 ? 0 : 99))}
            </span>
          </div>
          <button className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-medium hover:bg-terracotta-dark transition-colors mb-3">
            Proceed to Checkout
          </button>
          <button onClick={clearCart} className="w-full text-sm text-muted-foreground hover:text-destructive transition-colors py-2">
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
