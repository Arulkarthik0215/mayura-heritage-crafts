import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") || "—";

  return (
    <div className="section-padding">
      <div className="container-custom max-w-lg text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 15 }}>
          {/* Success icon */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been confirmed and you will receive a confirmation email shortly.
          </p>

          {/* Order card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6 mb-8 text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-mono font-bold text-foreground text-lg tracking-wide">{orderNumber}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-emerald-500 font-medium">Payment Confirmed ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span className="text-foreground font-medium">7–10 Business Days</span>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/"
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
            >
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
