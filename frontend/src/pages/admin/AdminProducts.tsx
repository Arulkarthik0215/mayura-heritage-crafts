import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  Star,
  Package,
  ImagePlus,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "@/lib/api";
import { toast } from "sonner";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  images: string[];
  featured: boolean;
  rating: string;
  reviews: string;
  inStock: boolean;
  tags: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "golu",
  images: [],
  featured: false,
  rating: "0",
  reviews: "0",
  inStock: true,
  tags: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchProducts()
      .then((res) => setProducts(res.products || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (product: any) => {
    setEditing(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      originalPrice: String(product.originalPrice ?? ""),
      category: product.category || "golu",
      images: product.images || [],
      featured: product.featured || false,
      rating: String(product.rating ?? "0"),
      reviews: String(product.reviews ?? "0"),
      inStock: product.inStock ?? true,
      tags: (product.tags || []).join(", "),
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadImage(file);
        urls.push(url);
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: form.price,
        originalPrice: form.originalPrice || null,
        category: form.category,
        images: form.images,
        featured: form.featured,
        rating: form.rating,
        reviews: form.reviews,
        inStock: form.inStock,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      setDeleteConfirm(null);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-cream">Products</h1>
          <p className="text-cream/40 text-sm mt-1">{products.length} product{products.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-terracotta-dark text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-10 pr-4 py-3 bg-[hsl(20,15%,14%)] border border-white/5 rounded-xl text-cream placeholder:text-cream/25 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-cream/15 mb-3" />
          <p className="text-cream/40 text-sm">No products found</p>
        </div>
      ) : (
        <div className="bg-[hsl(20,15%,14%)] border border-white/5 rounded-2xl overflow-hidden">
          {/* Desktop table head */}
          <div className="hidden md:grid grid-cols-[auto_1fr_100px_100px_80px_100px] gap-4 px-5 py-3 border-b border-white/5 text-xs font-medium text-cream/40 uppercase tracking-wider">
            <span className="w-12">Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map((product) => (
              <div key={product.id} className="flex flex-col md:grid md:grid-cols-[auto_1fr_100px_100px_80px_100px] gap-2 md:gap-4 md:items-center px-5 py-4 hover:bg-white/[0.02] transition-colors">
                {/* Image */}
                <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden shrink-0">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cream/15">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {/* Name + desc */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-cream truncate">{product.name}</p>
                  <p className="text-xs text-cream/30 truncate">{product.description}</p>
                </div>
                {/* Category */}
                <span className="text-xs text-cream/50 capitalize bg-white/5 px-2.5 py-1 rounded-full w-fit">
                  {product.category}
                </span>
                {/* Price */}
                <span className="text-sm font-semibold text-cream">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
                {/* Status */}
                <span className={`flex items-center gap-1 text-xs font-medium ${product.inStock ? "text-emerald-400" : "text-red-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-emerald-400" : "bg-red-400"}`} />
                  {product.inStock ? "Active" : "Out"}
                </span>
                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 text-cream/40 hover:text-cream hover:bg-white/5 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id)}
                    className="p-2 text-cream/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                <h3 className="text-lg font-serif font-bold text-cream mb-2">Delete Product?</h3>
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

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-[hsl(20,15%,14%)] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl z-10"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
                <h2 className="text-lg font-serif font-bold text-cream">
                  {editing ? "Edit Product" : "Add Product"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-cream/40 hover:text-cream">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-cream/20"
                    placeholder="Product name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-cream/20 resize-none"
                    placeholder="Product description"
                  />
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Price (₹) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-cream/20"
                      placeholder="e.g. 4999"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Original Price</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.originalPrice}
                      onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-cream/20"
                      placeholder="e.g. 5999"
                    />
                  </div>
                </div>

                {/* Category + Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="golu" className="bg-[hsl(20,15%,14%)] text-cream">Golu Dolls</option>
                      <option value="idols" className="bg-[hsl(20,15%,14%)] text-cream">Idols</option>
                      <option value="decor" className="bg-[hsl(20,15%,14%)] text-cream">Spiritual Decor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Tags</label>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-cream/20"
                      placeholder="bestseller, premium"
                    />
                  </div>
                </div>

                {/* Rating + Reviews */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Rating</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.rating}
                      onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Reviews Count</label>
                    <input
                      type="number"
                      min="0"
                      value={form.reviews}
                      onChange={(e) => setForm((f) => ({ ...f, reviews: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                        form.featured ? "bg-primary" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          form.featured ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                    <span className="text-sm text-cream/70">Featured</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setForm((f) => ({ ...f, inStock: !f.inStock }))}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                        form.inStock ? "bg-emerald-500" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          form.inStock ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </div>
                    <span className="text-sm text-cream/70">In Stock</span>
                  </label>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-2">Images</label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    {form.images.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <ImagePlus className="w-5 h-5 text-cream/30" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-cream/30">Upload images to S3. Accepted: JPEG, PNG, WebP, GIF.</p>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-white/5 text-cream rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-primary to-terracotta-dark text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editing ? "Update Product" : "Create Product"}
                      </>
                    )}
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

export default AdminProducts;
