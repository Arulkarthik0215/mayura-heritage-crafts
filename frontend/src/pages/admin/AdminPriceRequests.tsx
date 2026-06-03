import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Trash2,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  User,
  Package,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  fetchPriceRequests,
  updatePriceRequest,
  deletePriceRequest,
} from "@/lib/api";
import { toast } from "sonner";

const AdminPriceRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "RESPONDED">("ALL");

  const load = useCallback(() => {
    setLoading(true);
    fetchPriceRequests()
      .then((res) => setRequests(res.priceRequests || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleMarkResponded = async (id: string) => {
    try {
      await updatePriceRequest(id, { status: "RESPONDED" });
      toast.success("Marked as responded");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePriceRequest(id);
      toast.success("Price request deleted");
      setDeleteConfirm(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-cream">Price Requests</h1>
          <p className="text-cream/40 text-sm mt-1">
            {requests.length} request{requests.length !== 1 ? "s" : ""} total
            {pendingCount > 0 && (
              <span className="ml-2 text-amber-400">• {pendingCount} pending</span>
            )}
          </p>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(["ALL", "PENDING", "RESPONDED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-white"
                  : "text-cream/50 hover:text-cream hover:bg-white/5"
              }`}
            >
              {f === "ALL" ? "All" : f === "PENDING" ? "Pending" : "Responded"}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or product…"
          className="w-full pl-10 pr-4 py-3 bg-[hsl(20,15%,14%)] border border-white/5 rounded-xl text-cream placeholder:text-cream/25 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl p-12 text-center">
          <Tag className="w-12 h-12 mx-auto text-cream/15 mb-3" />
          <p className="text-cream/40 text-sm">
            {search || filter !== "ALL" ? "No matching requests found" : "No price requests yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Customer info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        req.status === "PENDING"
                          ? "bg-amber-400/10 text-amber-400"
                          : "bg-emerald-400/10 text-emerald-400"
                      }`}
                    >
                      {req.status === "PENDING" ? (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                      ) : (
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Responded</span>
                      )}
                    </span>
                    <span className="text-[10px] text-cream/25">
                      {new Date(req.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                    <p className="text-sm font-medium text-cream truncate">{req.productName}</p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-cream/60">
                      <User className="w-3 h-3" /> {req.name}
                    </span>
                    <a
                      href={`mailto:${req.email}`}
                      className="flex items-center gap-1.5 text-xs text-cream/60 hover:text-primary transition-colors"
                    >
                      <Mail className="w-3 h-3" /> {req.email}
                    </a>
                    <a
                      href={`tel:${req.phone}`}
                      className="flex items-center gap-1.5 text-xs text-cream/60 hover:text-primary transition-colors"
                    >
                      <Phone className="w-3 h-3" /> {req.phone}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "PENDING" && (
                    <button
                      onClick={() => handleMarkResponded(req.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Responded
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(req.id)}
                    className="p-2 text-cream/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[hsl(20,15%,16%)] border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-400/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-serif font-bold text-cream mb-2">Delete Request?</h3>
                <p className="text-sm text-cream/50 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 bg-white/5 text-cream rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPriceRequests;
