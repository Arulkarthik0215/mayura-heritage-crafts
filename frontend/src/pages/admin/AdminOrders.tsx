import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, ChevronDown, X, Truck, MapPin, Clock, Eye, Loader2 } from "lucide-react";
import { fetchAdminOrders, updateOrderStatus } from "@/lib/api";
import { toast } from "sonner";

const STATUS_OPTIONS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400",
  PAID: "bg-emerald-500/15 text-emerald-400",
  PROCESSING: "bg-blue-500/15 text-blue-400",
  SHIPPED: "bg-violet-500/15 text-violet-400",
  DELIVERED: "bg-emerald-600/15 text-emerald-300",
  CANCELLED: "bg-red-500/15 text-red-400",
};

const formatPrice = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = () => {
    setLoading(true);
    fetchAdminOrders()
      .then((data) => setOrders(data.orders))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { order: updated } = await updateOrderStatus(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      toast.success(`Order updated to ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTrackingSave = async (orderId: string, trackingNumber: string) => {
    try {
      const { order: updated } = await updateOrderStatus(orderId, { trackingNumber });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      toast.success("Tracking number saved");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = search === "" || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-cream">Orders</h1>
        <p className="text-cream/40 text-sm mt-1">Manage customer orders and shipments.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[hsl(20,15%,14%)] border border-white/5 text-cream text-sm placeholder:text-cream/30 focus:outline-none focus:border-primary/50" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl bg-[hsl(20,15%,14%)] border border-white/5 text-cream text-sm focus:outline-none focus:border-primary/50 cursor-pointer">
            <option value="ALL">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 mx-auto text-cream/20 mb-3" />
          <p className="text-cream/40 text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl overflow-hidden">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.6fr_0.5fr] gap-4 px-5 py-3 border-b border-white/5 text-xs text-cream/40 font-medium uppercase tracking-wider">
            <span>Order</span><span>Customer</span><span>Date</span><span>Total</span><span>Status</span><span></span>
          </div>

          <div className="divide-y divide-white/5">
            {filtered.map((order) => (
              <div key={order.id} className="md:grid md:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.6fr_0.5fr] gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors items-center">
                {/* Order number */}
                <div>
                  <p className="text-sm font-mono font-semibold text-cream">{order.orderNumber}</p>
                  <p className="text-xs text-cream/30 md:hidden mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                {/* Customer */}
                <div className="mt-1 md:mt-0">
                  <p className="text-sm text-cream truncate">{order.customerName}</p>
                  <p className="text-xs text-cream/30 truncate">{order.customerEmail}</p>
                </div>
                {/* Date */}
                <div className="hidden md:block">
                  <p className="text-sm text-cream/60">{formatDate(order.createdAt)}</p>
                </div>
                {/* Total */}
                <div className="mt-1 md:mt-0">
                  <p className="text-sm font-semibold text-cream">{formatPrice(order.totalAmount)}</p>
                  <p className="text-xs text-cream/30">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</p>
                </div>
                {/* Status */}
                <div className="mt-2 md:mt-0">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${STATUS_COLORS[order.status] || "bg-white/10 text-cream/60"}`}>
                    {order.status}
                  </span>
                </div>
                {/* Actions */}
                <div className="mt-2 md:mt-0 flex justify-end">
                  <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg text-cream/40 hover:text-cream hover:bg-white/5 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[hsl(20,15%,13%)] border-l border-white/5 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-serif font-bold text-cream">Order Details</h2>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 text-cream/40 hover:text-cream rounded-lg hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Order number */}
                <div className="mb-6 p-4 rounded-xl bg-[hsl(20,15%,16%)] border border-white/5">
                  <p className="text-xs text-cream/40 mb-1">Order Number</p>
                  <p className="font-mono font-bold text-cream text-lg">{selectedOrder.orderNumber}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-cream/40">
                    <Clock className="w-3 h-3" /> {formatDate(selectedOrder.createdAt)}
                    {selectedOrder.paidAt && <span className="text-emerald-400">• Paid {formatDate(selectedOrder.paidAt)}</span>}
                  </div>
                </div>

                {/* Status Update */}
                <div className="mb-6">
                  <p className="text-xs text-cream/40 mb-2 uppercase tracking-wider font-medium">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s} disabled={updatingId === selectedOrder.id}
                        onClick={() => handleStatusChange(selectedOrder.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedOrder.status === s
                            ? STATUS_COLORS[s] + " ring-1 ring-current"
                            : "bg-white/5 text-cream/40 hover:text-cream hover:bg-white/10"
                        } disabled:opacity-50`}
                      >
                        {updatingId === selectedOrder.id ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer */}
                <div className="mb-6">
                  <p className="text-xs text-cream/40 mb-2 uppercase tracking-wider font-medium">Customer</p>
                  <div className="p-4 rounded-xl bg-[hsl(20,15%,16%)] border border-white/5 space-y-1">
                    <p className="text-sm text-cream font-medium">{selectedOrder.customerName}</p>
                    <p className="text-xs text-cream/50">{selectedOrder.customerEmail}</p>
                    <p className="text-xs text-cream/50">{selectedOrder.customerPhone}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <p className="text-xs text-cream/40 mb-2 uppercase tracking-wider font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> Shipping Address</p>
                  <div className="p-4 rounded-xl bg-[hsl(20,15%,16%)] border border-white/5 text-sm text-cream/70 space-y-0.5">
                    <p>{selectedOrder.addressLine1}</p>
                    {selectedOrder.addressLine2 && <p>{selectedOrder.addressLine2}</p>}
                    <p>{selectedOrder.city}, {selectedOrder.state} {selectedOrder.postalCode}</p>
                    <p className="font-medium text-cream/90">{selectedOrder.country}</p>
                  </div>
                </div>

                {/* Tracking */}
                <div className="mb-6">
                  <p className="text-xs text-cream/40 mb-2 uppercase tracking-wider font-medium flex items-center gap-1"><Truck className="w-3 h-3" /> Tracking Number</p>
                  <div className="flex gap-2">
                    <input defaultValue={selectedOrder.trackingNumber || ""} id="tracking-input"
                      placeholder="Enter tracking number"
                      className="flex-1 px-3 py-2 rounded-lg bg-[hsl(20,15%,16%)] border border-white/5 text-cream text-sm placeholder:text-cream/20 focus:outline-none focus:border-primary/50" />
                    <button onClick={() => {
                      const el = document.getElementById("tracking-input") as HTMLInputElement;
                      if (el) handleTrackingSave(selectedOrder.id, el.value);
                    }}
                      className="px-4 py-2 rounded-lg bg-primary/15 text-primary text-sm font-medium hover:bg-primary/25 transition-colors">
                      Save
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <p className="text-xs text-cream/40 mb-2 uppercase tracking-wider font-medium">Items ({selectedOrder.items?.length || 0})</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-[hsl(20,15%,16%)] border border-white/5">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-cream/20"><Package className="w-5 h-5" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-cream font-medium truncate">{item.productName}</p>
                          <p className="text-xs text-cream/40">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <p className="text-sm font-semibold text-cream self-center">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-4 rounded-xl bg-[hsl(20,15%,16%)] border border-white/5 space-y-2 text-sm">
                  <div className="flex justify-between text-cream/60">
                    <span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-cream/60">
                    <span>Shipping</span>
                    <span className={selectedOrder.shippingCharge === 0 ? "text-emerald-400" : ""}>
                      {selectedOrder.shippingCharge === 0 ? "Free" : formatPrice(selectedOrder.shippingCharge)}
                    </span>
                  </div>
                  <div className="border-t border-white/5 pt-2 flex justify-between text-cream font-bold text-base">
                    <span>Total</span><span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Razorpay IDs */}
                {selectedOrder.razorpayPaymentId && (
                  <div className="mt-4 p-3 rounded-xl bg-[hsl(20,15%,16%)] border border-white/5 text-xs text-cream/30 space-y-1">
                    <p>Razorpay Payment: <span className="text-cream/50 font-mono">{selectedOrder.razorpayPaymentId}</span></p>
                    <p>Razorpay Order: <span className="text-cream/50 font-mono">{selectedOrder.razorpayOrderId}</span></p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
