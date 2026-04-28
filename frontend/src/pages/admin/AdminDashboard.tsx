import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Layers, MessageSquareQuote, TrendingUp, ArrowRight, ShoppingBag, IndianRupee } from "lucide-react";
import { fetchProducts, fetchCategories, fetchTestimonials, fetchOrderStats } from "@/lib/api";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalTestimonials: number;
  featuredProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  to,
  index,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  to: string;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Link
      to={to}
      className="block bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl p-6 hover:border-white/10 hover:bg-[hsl(20,15%,16%)] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <ArrowRight className="w-4 h-4 text-cream/20 group-hover:text-cream/50 transition-colors" />
      </div>
      <p className="text-3xl font-bold text-cream mb-1">{value}</p>
      <p className="text-sm text-cream/50">{label}</p>
    </Link>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalCategories: 0,
    totalTestimonials: 0,
    featuredProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchTestimonials(), fetchOrderStats().catch(() => ({ totalOrders: 0, paidOrders: 0, totalRevenue: 0 }))])
      .then(([prodRes, catRes, testRes, orderStats]) => {
        const products = prodRes.products || [];
        setStats({
          totalProducts: products.length,
          totalCategories: (catRes.categories || []).length,
          totalTestimonials: (testRes.testimonials || []).length,
          featuredProducts: products.filter((p: any) => p.featured).length,
          totalOrders: orderStats.totalOrders || 0,
          totalRevenue: orderStats.totalRevenue || 0,
        });
        setRecentProducts(products.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-cream">Dashboard</h1>
        <p className="text-cream/40 text-sm mt-1">Welcome back. Here's an overview of your store.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard index={0} icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="bg-amber-500/15 text-amber-400" to="/admin/orders" />
        <StatCard index={1} icon={IndianRupee} label="Revenue" value={Math.round(stats.totalRevenue / 100)} color="bg-emerald-500/15 text-emerald-400" to="/admin/orders" />
        <StatCard index={2} icon={Package} label="Total Products" value={stats.totalProducts} color="bg-primary/15 text-primary" to="/admin/products" />
        <StatCard index={3} icon={TrendingUp} label="Featured" value={stats.featuredProducts} color="bg-gold/15 text-gold" to="/admin/products" />
        <StatCard index={4} icon={Layers} label="Categories" value={stats.totalCategories} color="bg-blue-500/15 text-blue-400" to="/admin/categories" />
        <StatCard index={5} icon={MessageSquareQuote} label="Testimonials" value={stats.totalTestimonials} color="bg-violet-500/15 text-violet-400" to="/admin/testimonials" />
      </div>

      {/* Recent Products */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-semibold text-cream">Recent Products</h2>
          <Link to="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl overflow-hidden">
          {recentProducts.length === 0 ? (
            <div className="p-8 text-center text-cream/40 text-sm">
              No products yet.{" "}
              <Link to="/admin/products" className="text-primary hover:underline">
                Add your first product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentProducts.map((product: any) => (
                <div key={product.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cream/20">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-cream truncate">{product.name}</p>
                    <p className="text-xs text-cream/40 capitalize">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-cream">₹{product.price?.toLocaleString("en-IN")}</p>
                    <p className={`text-xs ${product.inStock ? "text-emerald-400" : "text-red-400"}`}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
