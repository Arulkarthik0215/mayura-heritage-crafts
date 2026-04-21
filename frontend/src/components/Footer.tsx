import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "@/lib/api";

const Footer = () => {
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  return (
  <footer className="bg-warm-brown text-cream">
    <div className="container-custom section-padding">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo/mayura-heritage-crafts-logo.jpeg" alt="Mayura Heritage Crafts Logo" className="w-10 h-10 object-contain bg-cream rounded-full border border-cream/20" />
            <h3 className="text-xl font-serif font-bold">{settings?.siteName || "Mayura Heritage Crafts"}</h3>
          </div>
          <p className="text-sm opacity-80 leading-relaxed">
            {settings?.tagline || "Preserving the timeless art of Hindu craftsmanship. Each piece tells a story of devotion, tradition, and artistic excellence."}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {[
              { to: "/products", label: "All Products" },
              { to: "/products?category=golu", label: "Golu Dolls" },
              { to: "/products?category=idols", label: "Idols" },
              { to: "/products?category=decor", label: "Spiritual Decor" },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:opacity-100 transition-opacity">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-serif font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/about" className="hover:opacity-100 transition-opacity">Our Story</Link></li>
            <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact Us</Link></li>
            <li><span className="opacity-60">Shipping Policy</span></li>
            <li><span className="opacity-60">Return Policy</span></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-serif font-semibold mb-4">Get in Touch</h4>
          <div className="text-sm opacity-80 space-y-2">
            <p>📧 {settings?.contactEmail || "sbecetce@gmail.com"}</p>
            <p>📞 {settings?.contactPhone || "+91 98433 94792"}</p>
            <p>📍 {settings?.contactAddress || "Madurai, Tamil Nadu, India"}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-cream/20 text-center text-sm opacity-60">
        <p>© {new Date().getFullYear()} {settings?.siteName || "Mayura Heritage Crafts"}. All rights reserved. Handcrafted with devotion 🙏</p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
