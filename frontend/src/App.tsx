import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrders from "./pages/admin/AdminOrders";

import ScrollToTop from "@/components/ScrollToTop";
const queryClient = new QueryClient();

/** Wraps public pages with the store Navbar + Footer */
const StoreLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* ── Admin panel (no store Navbar/Footer) ── */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* ── Public storefront ── */}
                <Route path="/" element={<StoreLayout><Index /></StoreLayout>} />
                <Route path="/products" element={<StoreLayout><Products /></StoreLayout>} />
                <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
                <Route path="/about" element={<StoreLayout><About /></StoreLayout>} />
                <Route path="/contact" element={<StoreLayout><Contact /></StoreLayout>} />
                <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
                <Route path="/checkout" element={<StoreLayout><Checkout /></StoreLayout>} />
                <Route path="/order-success" element={<StoreLayout><OrderSuccess /></StoreLayout>} />
                <Route path="*" element={<StoreLayout><NotFound /></StoreLayout>} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
