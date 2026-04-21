import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Check, AlertCircle, MessageSquareQuote, Star } from "lucide-react";
import { fetchTestimonials, createTestimonial, deleteTestimonial } from "@/lib/api";
import { toast } from "sonner";

interface TestimonialForm {
  name: string;
  location: string;
  text: string;
  rating: string;
}

const emptyForm: TestimonialForm = { name: "", location: "", text: "", rating: "5" };

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TestimonialForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchTestimonials()
      .then((res) => setTestimonials(res.testimonials || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTestimonial({
        ...form,
        rating: parseInt(form.rating),
      });
      toast.success("Testimonial added");
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id);
      toast.success("Testimonial deleted");
      setDeleteConfirm(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-cream">Testimonials</h1>
          <p className="text-cream/40 text-sm mt-1">Manage customer reviews</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setShowModal(true); }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-terracotta-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl p-12 text-center">
          <MessageSquareQuote className="w-12 h-12 mx-auto text-cream/15 mb-3" />
          <p className="text-cream/40 text-sm">No testimonials yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <button
                  onClick={() => setDeleteConfirm(t.id)}
                  className="p-1.5 text-cream/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-cream/60 leading-relaxed mb-4 italic">"{t.text}"</p>
              <div>
                <p className="text-sm font-semibold text-cream">{t.name}</p>
                <p className="text-xs text-cream/40">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-black/60" />
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
                <h3 className="text-lg font-serif font-bold text-cream mb-2">Delete Testimonial?</h3>
                <p className="text-sm text-cream/50 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-white/5 text-cream rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60" />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[hsl(20,15%,14%)] border border-white/10 rounded-2xl shadow-2xl z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-serif font-bold text-cream">Add Testimonial</h2>
                <button onClick={() => setShowModal(false)} className="text-cream/40 hover:text-cream"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Customer Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-cream/20" placeholder="e.g. Priya Ramanathan" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Location *</label>
                  <input required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-cream/20" placeholder="e.g. Chennai" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Review Text *</label>
                  <textarea required rows={3} value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-cream/20 resize-none" placeholder="Customer review text…" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Rating (1–5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, rating: String(n) }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            n <= parseInt(form.rating) ? "fill-gold text-gold" : "text-cream/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-white/5 text-cream rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-primary to-terracotta-dark text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    Add Testimonial
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTestimonials;
