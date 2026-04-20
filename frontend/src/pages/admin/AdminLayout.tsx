import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Layers,
  MessageSquareQuote,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, label: "Products", end: false },
  { to: "/admin/categories", icon: Layers, label: "Categories", end: false },
  { to: "/admin/testimonials", icon: MessageSquareQuote, label: "Testimonials", end: false },
];

const AdminLayout = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(20,15%,10%)]">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 ${collapsed && !mobile ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-terracotta-dark flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-bold">M</span>
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <h2 className="text-sm font-serif font-bold text-cream truncate">Mayura Admin</h2>
            <p className="text-[10px] text-cream/40 truncate">{user.email}</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => mobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-cream/60 hover:text-cream hover:bg-white/5"
              } ${collapsed && !mobile ? "justify-center" : ""}`
            }
          >
            <link.icon className="w-5 h-5 shrink-0" />
            {(!collapsed || mobile) && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-all ${
            collapsed && !mobile ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(!collapsed || mobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[hsl(20,15%,10%)] overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[hsl(20,15%,13%)] border-r border-white/5 transition-all duration-300 shrink-0 ${
          collapsed ? "w-[70px]" : "w-[250px]"
        }`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-[54px] -right-3 w-6 h-6 bg-[hsl(20,15%,18%)] border border-white/10 rounded-full flex items-center justify-center text-cream/50 hover:text-cream transition-colors z-10"
          style={{ left: collapsed ? "57px" : "237px" }}
        >
          <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-[260px] bg-[hsl(20,15%,13%)] border-r border-white/5 z-50 lg:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile only) */}
        <header className="lg:hidden h-14 bg-[hsl(20,15%,13%)] border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-cream/60 hover:text-cream">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-serif font-bold text-cream">Mayura Admin</h2>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
