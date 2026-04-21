import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "@/lib/api";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    siteName: "",
    tagline: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    heroTitle: "",
    heroSubtitle: "",
    homeAboutTitle: "",
    homeAboutSubtitle: "",
    homeAboutText1: "",
    homeAboutText2: "",
    aboutPageText: "",
  });

  const { isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const data = await fetchSettings();
      setForm(data);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-cream">Site Settings</h1>
        <p className="text-cream/50 mt-1">Manage global website content and details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[hsl(20,15%,13%)] border border-white/5 rounded-2xl p-6 md:p-8">
        
        {/* General Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-semibold text-cream border-b border-white/5 pb-2">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Site / Header Name</label>
              <input
                name="siteName"
                value={form.siteName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Tagline (Hero/Footer)</label>
              <input
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-serif font-semibold text-cream border-b border-white/5 pb-2">Home Hero Section</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Hero Title</label>
              <input
                name="heroTitle"
                value={form.heroTitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Hero Subtitle</label>
              <textarea
                name="heroSubtitle"
                value={form.heroSubtitle}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-serif font-semibold text-cream border-b border-white/5 pb-2">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Email</label>
              <input
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Address</label>
              <textarea
                name="contactAddress"
                value={form.contactAddress}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Home About Section */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-serif font-semibold text-cream border-b border-white/5 pb-2">Home Page 'About' Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Small Title</label>
              <input
                name="homeAboutTitle"
                value={form.homeAboutTitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Main Heading</label>
              <input
                name="homeAboutSubtitle"
                value={form.homeAboutSubtitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">First Paragraph</label>
              <textarea
                name="homeAboutText1"
                value={form.homeAboutText1}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">Second Paragraph</label>
              <textarea
                name="homeAboutText2"
                value={form.homeAboutText2}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Global About Page */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-serif font-semibold text-cream border-b border-white/5 pb-2">About Us Page</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-cream/60 uppercase tracking-wider mb-1.5">About Us Detailed Content</label>
              <div className="text-xs text-cream/40 mb-2">You can use Markdown or plain text here. Paragraphs are separated by double line breaks.</div>
              <textarea
                name="aboutPageText"
                value={form.aboutPageText}
                onChange={handleChange}
                rows={10}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-cream focus:ring-2 focus:ring-primary/30 resize-none whitespace-pre-wrap"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-3 bg-primary text-cream rounded-xl font-medium hover:bg-terracotta-dark transition-colors flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
