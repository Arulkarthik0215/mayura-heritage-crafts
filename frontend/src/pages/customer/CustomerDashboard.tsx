import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Package, MapPin, LogOut, ShoppingBag, ChevronRight } from 'lucide-react';

const CustomerDashboard = () => {
  const { customer, isAuthenticated, logout } = useCustomerAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !customer) {
    navigate('/account/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="section-padding">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-xl border-2 border-primary/20">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">Hello, {customer.name.split(' ')[0]}!</h1>
              <p className="text-muted-foreground text-sm">Manage your account and orders</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="text-lg font-serif font-semibold text-foreground mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-4 border border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-foreground font-medium">{customer.name}</p>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-foreground font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" /> {customer.email}
                </p>
              </div>
              {customer.phone && (
                <div className="bg-background rounded-lg p-4 border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-foreground font-medium">{customer.phone}</p>
                </div>
              )}
              {customer.city && (
                <div className="bg-background rounded-lg p-4 border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                  <p className="text-foreground font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {customer.city}{customer.state ? `, ${customer.state}` : ''}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h2 className="text-lg font-serif font-semibold text-foreground mb-5">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/account/orders"
                className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">My Orders</p>
                    <p className="text-xs text-muted-foreground">View order history</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                to="/track-order"
                className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Track Order</p>
                    <p className="text-xs text-muted-foreground">Check shipment status</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                to="/products"
                className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Browse Products</p>
                    <p className="text-xs text-muted-foreground">Continue shopping</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
