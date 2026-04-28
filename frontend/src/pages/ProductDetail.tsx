import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { ShoppingCart, Star, ArrowLeft, ArrowRight, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { products as fallbackProducts } from "@/data/products";
import type { Product } from "@/data/products";
import { fetchProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import SEO from "@/components/SEO";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((res) => {
        if (res?.products) {
          const found = res.products.find((p: any) => p.id === id);
          if (found) {
            setProduct(found);
            setRelatedProducts(res.products.filter((p: any) => p.category === found.category && p.id !== found.id).slice(0, 4));
          } else {
            // Unlikely to hit this if the id exists, but fallback to static if not found
            fallbackLoad();
          }
        } else {
          fallbackLoad();
        }
      })
      .catch(() => {
        fallbackLoad();
      })
      .finally(() => setLoading(false));

      const fallbackLoad = () => {
        const found = fallbackProducts.find((p) => p.id === id);
        if (found) {
          setProduct(found);
          setRelatedProducts(fallbackProducts.filter((p) => p.category === found.category && p.id !== found.id).slice(0, 4));
        }
      }
  }, [id]);

  // Carousel slide tracking
  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    setSlideCount(carouselApi.scrollSnapList().length);
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi, onSelect]);

  const scrollToSlide = useCallback(
    (index: number) => {
      carouselApi?.scrollTo(index);
    },
    [carouselApi]
  );

  if (loading) {
    return (
      <div className="section-padding text-center container-custom min-h-[50vh] flex items-center justify-center">
         <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section-padding text-center container-custom">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Product Not Found</h1>
        <Link to="/products" className="text-primary hover:underline">← Back to Products</Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setShowModal(true);
    toast.success(`${product.name} added to cart`);
  };

  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const hasMultipleImages = images.length > 1;

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images[0] || "https://mayuraheritagecrafts.com/logo/mayura-heritage-crafts-logo.jpeg",
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://mayuraheritagecrafts.com/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="section-padding">
      <SEO 
        title={`${product.name} | Mayura Heritage Crafts`}
        description={product.description.substring(0, 160)}
        image={product.images[0]}
        schema={productSchema}
      />
      <div className="container-custom">
        {/* Breadcrumb */}
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        {/* Product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
          {/* Image Carousel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {/* Main Carousel */}
            <div className="relative group">
              <Carousel
                opts={{
                  loop: true,
                  align: "center",
                }}
                setApi={setCarouselApi}
                className="w-full"
              >
                <CarouselContent>
                  {images.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-secondary">
                        <img
                          src={img}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Custom arrow buttons - only show when multiple images */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={() => carouselApi?.scrollPrev()}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-lg flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white dark:hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => carouselApi?.scrollNext()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-lg flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white dark:hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </Carousel>

              {/* Slide counter badge */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {currentSlide + 1} / {slideCount}
                </div>
              )}
            </div>

            {/* Dot indicators */}
            {hasMultipleImages && (
              <div className="flex items-center justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? "w-8 h-2.5 bg-primary"
                        : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail strip */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                      index === currentSlide
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100"
                        : "opacity-50 hover:opacity-80"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{product.name}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(Number(product.rating || 0))
                        ? "fill-gold text-gold"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  ({product.reviews || 0} reviews)
                </span>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.inStock ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-serif font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* About This Product */}
            <div className="bg-secondary/50 border border-border rounded-2xl p-5 mb-8">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                About This Product
              </h3>
              <p className="text-muted-foreground leading-relaxed text-[15px]">{product.description}</p>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-10 py-4 rounded-lg font-medium text-lg hover:bg-terracotta-dark transition-colors mb-8"
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders above ₹999" },
                { icon: Shield, label: "Secure Payment", sub: "100% protected" },
                { icon: RotateCcw, label: "Easy Returns", sub: "7-day returns" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon className="w-5 h-5 mx-auto text-primary mb-1" />
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}

      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground text-center flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-500" />
              </div>
              Added to Cart!
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-base text-muted-foreground">
              <b>{product.name}</b> has been added to your shopping cart.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 rounded-lg font-medium border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => { setShowModal(false); navigate('/cart'); }}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
            >
              View Cart
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
