import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Truck, Globe, CreditCard, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createOrder, verifyPayment } from "@/lib/api";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  "Chandigarh","Puducherry","Lakshadweep","Andaman and Nicobar Islands","Dadra and Nagar Haveli and Daman and Diu",
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Tamil Nadu",
    postalCode: "",
    country: "India",
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const isIndia = form.country === "India";
  const shippingCharge = isIndia ? (totalPrice >= 999 ? 0 : 99) : 1499;
  const grandTotal = totalPrice + shippingCharge;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Dynamically load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Basic validation
    if (!form.customerName || !form.customerEmail || !form.customerPhone || !form.addressLine1 || !form.city || !form.state || !form.postalCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setLoading(false);
        return;
      }

      // Create order on backend
      const { order, razorpayKeyId } = await createOrder({
        ...form,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });

      // Open Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: order.totalAmount,
        currency: "INR",
        name: "Mayura Heritage Crafts",
        description: `Order ${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const result = await verifyPayment(response);
            if (result.success) {
              clearCart();
              navigate(`/order-success?order=${result.order.orderNumber}`);
            }
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: form.customerName,
          email: form.customerEmail,
          contact: form.customerPhone,
        },
        theme: {
          color: "#C65D3E",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="section-padding text-center container-custom">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Nothing to Checkout</h1>
          <p className="text-muted-foreground mb-6">Add some products to your cart first.</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-terracotta-dark transition-colors">
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom max-w-6xl">
        <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Left: Form ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-xl border border-border">
                <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Contact Information
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Full Name *</label>
                    <input name="customerName" value={form.customerName} onChange={handleChange} required
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Phone *</label>
                    <input name="customerPhone" value={form.customerPhone} onChange={handleChange} required type="tel"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-1.5">Email *</label>
                    <input name="customerEmail" value={form.customerEmail} onChange={handleChange} required type="email"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card p-6 rounded-xl border border-border">
                <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" /> Shipping Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-1.5">Address Line 1 *</label>
                    <input name="addressLine1" value={form.addressLine1} onChange={handleChange} required placeholder="House no, Street, Area"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-muted-foreground mb-1.5">Address Line 2</label>
                    <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Landmark, Apartment (optional)"
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Country *</label>
                    <select name="country" value={form.country} onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Singapore">Singapore</option>
                      <option value="UAE">UAE</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Germany">Germany</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">{isIndia ? "State" : "State / Province"} *</label>
                    {isIndia ? (
                      <select name="state" value={form.state} onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all">
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <input name="state" value={form.state} onChange={handleChange} required
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} required
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">{isIndia ? "PIN Code" : "Postal / ZIP Code"} *</label>
                    <input name="postalCode" value={form.postalCode} onChange={handleChange} required
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card p-6 rounded-xl border border-border sticky top-24">
                <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatPrice(product.price * quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Shipping {!isIndia && <Globe className="w-3 h-3" />}
                    </span>
                    <span className={`font-medium ${shippingCharge === 0 ? "text-emerald-500" : "text-foreground"}`}>
                      {shippingCharge === 0 ? "Free" : formatPrice(shippingCharge)}
                    </span>
                  </div>
                  {!isIndia && (
                    <p className="text-[11px] text-amber-500/80 flex items-center gap-1">
                      <Globe className="w-3 h-3" /> International shipping applies
                    </p>
                  )}
                </div>

                <div className="border-t border-border mt-4 pt-4 flex justify-between items-center mb-6">
                  <span className="font-serif font-semibold text-foreground">Total</span>
                  <span className="font-serif font-bold text-2xl text-foreground">{formatPrice(grandTotal)}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-medium hover:bg-terracotta-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Pay {formatPrice(grandTotal)}</>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secured by Razorpay — 256-bit encryption</span>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
