import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Search, Package, Calendar, IndianRupee, Truck } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SHIPPED: 'bg-blue-100 text-blue-700 border-blue-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
};

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [orderData, setOrderData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOrderData(null);
    try {
      const res = await fetch(`${api.baseUrl}/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrderData(data.order);
      } else {
        toast.error(data.error || 'Order not found');
      }
    } catch (err) {
      toast.error('An error occurred while tracking the order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container-custom max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Track Your Order</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your order number and email to check the status</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-8"
        >
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Order Number</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  placeholder="e.g. MHC-260428-A1B2C"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="Email used during checkout"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-terracotta-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
            >
              {isLoading ? (
                <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Searching...</>
              ) : (
                <><Search className="w-4 h-4" /> Track Order</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Result */}
        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/5 border-b border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Order</p>
                <p className="font-mono font-semibold text-foreground text-lg">{orderData.orderNumber}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full border self-start ${statusColors[orderData.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {orderData.status}
              </span>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date Placed</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {new Date(orderData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                    {(orderData.totalAmount / 100).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Items</p>
                  <p className="text-sm font-medium text-foreground">{orderData.items?.length || 0} product{(orderData.items?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Tracking Info */}
              {orderData.trackingNumber && (
                <div className="mt-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-800 text-sm">Tracking Number: <span className="font-mono">{orderData.trackingNumber}</span></p>
                    <p className="text-xs text-emerald-600 mt-0.5">Use this number on the courier's website to track your shipment.</p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              {orderData.items && orderData.items.length > 0 && (
                <div className="pt-4 border-t border-border/50 space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Items Ordered</p>
                  {orderData.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 bg-background rounded-lg p-3 border border-border/50">
                      {item.productImage && (
                        <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{(item.price / 100).toLocaleString('en-IN')}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">₹{((item.price * item.quantity) / 100).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
