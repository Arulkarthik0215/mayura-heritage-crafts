import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Package, Calendar, IndianRupee } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SHIPPED: 'bg-blue-100 text-blue-700 border-blue-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const CustomerOrders = () => {
  const { isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/account/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('customer_token');
        const res = await fetch(`${api.baseUrl}/customer/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="section-padding text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/account" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-primary" /> Order History
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-12 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-serif font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Start shopping to see your orders here.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-terracotta-dark transition-colors text-sm">
              Browse Products
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold text-foreground text-base">{order.orderNumber}</span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3.5 h-3.5" /> {(order.totalAmount / 100).toLocaleString('en-IN')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="text-right bg-primary/5 rounded-lg px-4 py-2 border border-primary/10">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tracking</p>
                      <p className="text-sm font-mono font-medium text-primary">{order.trackingNumber}</p>
                    </div>
                  )}
                </div>

                {/* Order items preview */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50 flex gap-3 overflow-x-auto scrollbar-hide">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border/50 shrink-0">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-8 h-8 rounded object-cover" />
                        )}
                        <div>
                          <p className="text-xs font-medium text-foreground line-clamp-1 max-w-[120px]">{item.productName}</p>
                          <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
