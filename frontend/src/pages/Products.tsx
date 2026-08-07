import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, SlidersHorizontal, X, Star, ChevronDown, ChevronUp, RotateCcw, Check } from "lucide-react";
import { categories as fallbackCategories } from "@/data/products";
import type { Product } from "@/data/products";
import { fetchProducts, fetchCategories } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import SEO from "@/components/SEO";
import { Slider } from "@/components/ui/slider";

type SortOption = "featured" | "rating" | "price-asc" | "price-desc" | "newest";

const RATING_OPTIONS = [4, 3, 2, 1];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const FilterSection = ({
  id,
  title,
  isExpanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="border-b border-border/50 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "featured");
  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState(fallbackCategories);
  const [allSubCategories, setAllSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states from URL params
  const activeCategory = searchParams.get("category") || "all";
  const activeSubCategory = searchParams.get("subCategory") || "";
  const activePriceType = searchParams.get("priceType") || "all";
  const activeInStock = searchParams.get("inStock") === "true";
  const activeMinRating = searchParams.get("minRating") || "";
  const activeFeatured = searchParams.get("featured") === "true";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  const activeTags = searchParams.get("tags") || "";

  // Fetch live data from API, fall back to static data on failure
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchProducts().catch(() => null),
      fetchCategories().catch(() => null),
    ]).then(([prodRes, catRes]) => {
      if (prodRes?.products?.length) {
        setProducts(prodRes.products);
      } else {
        import("@/data/products").then((m) => setProducts(m.products));
      }
      if (catRes?.categories?.length) {
        setCategories(
          catRes.categories.map((c: any) => ({
            id: c.slug,
            name: c.name,
            description: c.description,
            icon: c.icon,
            subCategories: c.subCategories || [],
          }))
        );
        // Flatten all subcategories
        const allSubs = catRes.categories.flatMap((c: any) =>
          (c.subCategories || []).map((sc: any) => ({ ...sc, parentSlug: c.slug }))
        );
        setAllSubCategories(allSubs);
      }
    }).finally(() => setLoading(false));
  }, []);

  // Compute available tags from products
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((p) => (p.tags || []).forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [products]);

  // Price range bounds from products
  const priceBounds = useMemo(() => {
    const priced = products.filter((p) => p.price !== null && p.price !== undefined);
    if (priced.length === 0) return { min: 0, max: 10000 };
    const prices = priced.map((p) => p.price!);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Subcategories for the active category
  const currentSubCategories = useMemo(() => {
    if (activeCategory === "all") return allSubCategories;
    const cat = categories.find((c) => c.id === activeCategory) as any;
    return cat?.subCategories || [];
  }, [activeCategory, categories, allSubCategories]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== "all") count++;
    if (activeSubCategory) count++;
    if (activePriceType !== "all") count++;
    if (activeInStock) count++;
    if (activeMinRating) count++;
    if (activeFeatured) count++;
    if (activeMinPrice) count++;
    if (activeMaxPrice) count++;
    if (activeTags) count++;
    return count;
  }, [activeCategory, activeSubCategory, activePriceType, activeInStock, activeMinRating, activeFeatured, activeMinPrice, activeMaxPrice, activeTags]);

  // Apply all filters client-side
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category
    if (activeCategory !== "all") {
      filtered = filtered.filter(
        (p) =>
          p.category?.toLowerCase() === activeCategory.toLowerCase() ||
          p.category?.toLowerCase().replace(/\s+/g, "-") === activeCategory.toLowerCase()
      );
    }

    // Subcategory
    if (activeSubCategory) {
      filtered = filtered.filter(
        (p) => p.subCategory?.toLowerCase() === activeSubCategory.toLowerCase()
      );
    }

    // Price type
    if (activePriceType === "priced") {
      filtered = filtered.filter((p) => p.price !== null && p.price !== undefined);
    } else if (activePriceType === "request") {
      filtered = filtered.filter((p) => p.price === null || p.price === undefined);
    }

    // Price range
    if (activeMinPrice) {
      filtered = filtered.filter((p) => p.price !== null && p.price !== undefined && p.price >= parseFloat(activeMinPrice));
    }
    if (activeMaxPrice) {
      filtered = filtered.filter((p) => p.price !== null && p.price !== undefined && p.price <= parseFloat(activeMaxPrice));
    }

    // In stock
    if (activeInStock) {
      filtered = filtered.filter((p) => p.inStock);
    }

    // Min rating
    if (activeMinRating) {
      filtered = filtered.filter((p) => p.rating >= parseFloat(activeMinRating));
    }

    // Featured
    if (activeFeatured) {
      filtered = filtered.filter((p) => p.featured);
    }

    // Tags
    if (activeTags) {
      const selectedTags = activeTags.split(",");
      filtered = filtered.filter((p) =>
        selectedTags.some((t) => (p.tags || []).includes(t))
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        return filtered.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      case "price-desc":
        return filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "newest":
        return filtered;
      default:
        return filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [activeCategory, activeSubCategory, activePriceType, activeInStock, activeMinRating, activeFeatured, activeMinPrice, activeMaxPrice, activeTags, sortBy, products]);

  const updateParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all" || value === "false") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const updateParams = useCallback((updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || value === "false") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const toggleTag = useCallback((tag: string) => {
    const current = activeTags ? activeTags.split(",") : [];
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    updateParam("tags", next.join(","));
  }, [activeTags, updateParam]);

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setSortBy("featured");
  };

  // Local state for debounced price inputs
  const [localMinPrice, setLocalMinPrice] = useState(activeMinPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(activeMaxPrice);

  useEffect(() => {
    setLocalMinPrice(activeMinPrice);
  }, [activeMinPrice]);

  useEffect(() => {
    setLocalMaxPrice(activeMaxPrice);
  }, [activeMaxPrice]);

  // Collapsible filter sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["category", "price", "availability"]));
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const FilterPanel = () => (
    <div className="space-y-0">
      {/* Category */}
      <FilterSection id="category" title="Category" isExpanded={expandedSections.has("category")} onToggle={toggleSection}>
        <div className="space-y-1.5">
          {[{ id: "all", name: "All Categories" }, ...categories].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                updateParams({ category: cat.id, subCategory: "" });
              }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                activeCategory === cat.id
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Subcategory */}
      {currentSubCategories.length > 0 && (
        <FilterSection id="subcategory" title="Subcategory" isExpanded={expandedSections.has("subcategory")} onToggle={toggleSection}>
          <div className="space-y-1.5">
            <button
              onClick={() => updateParam("subCategory", "")}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                !activeSubCategory
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              All
            </button>
            {currentSubCategories.map((sub: any) => (
              <button
                key={sub.slug}
                onClick={() => updateParam("subCategory", sub.slug)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                  activeSubCategory === sub.slug
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Type */}
      <FilterSection id="pricetype" title="Price Type" isExpanded={expandedSections.has("pricetype")} onToggle={toggleSection}>
        <div className="space-y-1.5">
          {[
            { value: "all", label: "All" },
            { value: "priced", label: "With Price" },
            { value: "request", label: "Price on Request" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam("priceType", opt.value)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                activePriceType === opt.value
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection id="price" title="Price Range" isExpanded={expandedSections.has("price")} onToggle={toggleSection}>
        <div className="space-y-6 pt-2 pb-1 px-2">
          <Slider
            min={priceBounds.min}
            max={priceBounds.max}
            step={10}
            value={[
              localMinPrice ? parseInt(localMinPrice) : priceBounds.min,
              localMaxPrice ? parseInt(localMaxPrice) : priceBounds.max,
            ]}
            onValueChange={([min, max]) => {
              setLocalMinPrice(String(min));
              setLocalMaxPrice(String(max));
            }}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>₹{(localMinPrice ? parseInt(localMinPrice) : priceBounds.min).toLocaleString("en-IN")}</span>
            <span>₹{(localMaxPrice ? parseInt(localMaxPrice) : priceBounds.max).toLocaleString("en-IN")}</span>
          </div>
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (!localMinPrice || localMinPrice === String(priceBounds.min)) next.delete("minPrice");
              else next.set("minPrice", localMinPrice);
              
              if (!localMaxPrice || localMaxPrice === String(priceBounds.max)) next.delete("maxPrice");
              else next.set("maxPrice", localMaxPrice);
              
              setSearchParams(next);
            }}
            className="w-full py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg text-xs font-semibold transition-colors mt-2"
          >
            Apply Price Filter
          </button>
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection id="availability" title="Availability" isExpanded={expandedSections.has("availability")} onToggle={toggleSection}>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => updateParam("inStock", activeInStock ? "false" : "true")}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
              activeInStock ? "bg-emerald-500" : "bg-secondary"
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${activeInStock ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-foreground">In Stock Only</span>
        </label>
      </FilterSection>

      {/* Rating */}
      <FilterSection id="rating" title="Rating" isExpanded={expandedSections.has("rating")} onToggle={toggleSection}>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam("minRating", "")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
              !activeMinRating
                ? "bg-primary/15 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            Any Rating
          </button>
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => updateParam("minRating", String(r))}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMinRating === String(r)
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {Array.from({ length: r }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
              ))}
              <span className="ml-1">& up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Featured */}
      <FilterSection id="featured" title="Featured" isExpanded={expandedSections.has("featured")} onToggle={toggleSection}>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => updateParam("featured", activeFeatured ? "false" : "true")}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
              activeFeatured ? "bg-primary" : "bg-secondary"
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${activeFeatured ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-foreground">Featured Only</span>
        </label>
      </FilterSection>

      {/* Tags */}
      {availableTags.length > 0 && (
        <FilterSection id="tags" title="Tags" isExpanded={expandedSections.has("tags")} onToggle={toggleSection}>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = activeTags.split(",").includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all capitalize ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <div className="section-padding">
      <SEO
        title="Our Products | Mayura Heritage Crafts"
        description="Explore our curated collection of handcrafted Hindu art pieces, Golu dolls, divine sculptures, and spiritual decor."
        url="https://mayuraheritagecrafts.com/products"
      />
      <div className="container-custom">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-3">Our Products</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore our curated collection of handcrafted Hindu art pieces, each made with devotion and generations of expertise.
          </p>
        </motion.div>

        {/* Top controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden flex items-center gap-2 text-sm border px-4 py-2.5 rounded-xl transition-all ${
                showFilters
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-foreground hover:border-primary/30"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!loading && (
              <p className="text-sm text-muted-foreground hidden sm:block">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            )}
            
            {/* Custom Sort Dropdown */}
            <div className="relative z-30">
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 text-sm bg-secondary/80 hover:bg-secondary border border-border/60 hover:border-primary/40 text-foreground px-3.5 py-2 rounded-xl transition-all font-medium"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>{SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Sort By"}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isSortOpen ? "rotate-180 text-primary" : ""}`} />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsSortOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-card border border-border/80 rounded-xl shadow-xl z-30 overflow-hidden py-1.5"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.value);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left transition-colors ${
                            sortBy === opt.value
                              ? "bg-primary/15 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.value && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex gap-8">
          {/* Desktop sidebar filter */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 scrollbar-none">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              {FilterPanel()}
            </div>
          </aside>

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {/* Mobile results count */}
            {!loading && (
              <p className="text-sm text-muted-foreground mb-4 sm:hidden">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-2">No products found.</p>
                <p className="text-muted-foreground/60 text-sm mb-4">Try adjusting your filters to see more results.</p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-background border-r border-border z-50 lg:hidden flex flex-col"
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground">Filters</h2>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer body */}
                <div className="flex-1 overflow-y-auto p-5">
                  {FilterPanel()}
                </div>

                {/* Drawer footer */}
                <div className="border-t border-border px-5 py-4 shrink-0 flex gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex-1 py-2.5 text-sm font-medium text-muted-foreground bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Show {filteredProducts.length} Result{filteredProducts.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductsPage;
