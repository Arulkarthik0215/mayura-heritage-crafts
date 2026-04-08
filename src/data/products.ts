export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: "golu" | "sculptures" | "decor";
  images: string[];
  featured: boolean;
  rating: number;
  reviews: number;
  inStock: boolean;
  tags: string[];
}

export const categories = [
  { id: "golu", name: "Golu Dolls", description: "Traditional Navaratri Golu sets", icon: "🪔" },
  { id: "sculptures", name: "Sculptures", description: "Handcrafted divine sculptures", icon: "🕉️" },
  { id: "decor", name: "Spiritual Decor", description: "Handmade spiritual home decor", icon: "🏵️" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Navaratri Golu Set - Royal Court",
    description: "A stunning 15-piece Golu set depicting the royal Dasara court scene. Each doll is hand-painted with intricate details using natural pigments. Perfect centerpiece for your Navaratri celebrations.",
    price: 4999,
    originalPrice: 5999,
    category: "golu",
    images: ["/placeholder.svg"],
    featured: true,
    rating: 4.8,
    reviews: 124,
    inStock: true,
    tags: ["bestseller", "festive"],
  },
  {
    id: "2",
    name: "Golu Padi Set - 9 Steps Wooden",
    description: "Traditional 9-step wooden Golu padi (steps) made from seasoned teak wood. Foldable design for easy storage. Hand-polished with natural oils.",
    price: 3499,
    category: "golu",
    images: ["/placeholder.svg"],
    featured: true,
    rating: 4.6,
    reviews: 89,
    inStock: true,
    tags: ["popular"],
  },
  {
    id: "3",
    name: "Brass Ganesha Sculpture - 12 inch",
    description: "Exquisitely crafted brass Lord Ganesha sculpture. Each piece is individually cast using the traditional lost-wax method. A timeless addition to your pooja room.",
    price: 7999,
    originalPrice: 9499,
    category: "sculptures",
    images: ["/placeholder.svg"],
    featured: true,
    rating: 4.9,
    reviews: 203,
    inStock: true,
    tags: ["premium", "bestseller"],
  },
  {
    id: "4",
    name: "Terracotta Lakshmi Devi",
    description: "Hand-sculpted terracotta Goddess Lakshmi statue with gold leaf accents. Made by artisans from Thanjavur with generations of craft expertise.",
    price: 2999,
    category: "sculptures",
    images: ["/placeholder.svg"],
    featured: false,
    rating: 4.7,
    reviews: 67,
    inStock: true,
    tags: ["artisan"],
  },
  {
    id: "5",
    name: "Brass Diya Set - Temple Collection",
    description: "Set of 5 traditional brass diyas (oil lamps) inspired by South Indian temple designs. Each diya features intricate floral patterns.",
    price: 1499,
    category: "decor",
    images: ["/placeholder.svg"],
    featured: true,
    rating: 4.5,
    reviews: 156,
    inStock: true,
    tags: ["festive", "popular"],
  },
  {
    id: "6",
    name: "Kolam Welcome Mat - Handwoven",
    description: "Beautifully handwoven welcome mat featuring traditional Kolam patterns. Made from natural coir fiber with vibrant, fade-resistant colors.",
    price: 899,
    category: "decor",
    images: ["/placeholder.svg"],
    featured: false,
    rating: 4.3,
    reviews: 45,
    inStock: true,
    tags: ["new"],
  },
  {
    id: "7",
    name: "Marapachi Bommai Set - Classic",
    description: "Traditional Marapachi dolls carved from sacred wood. This classic couple set is an essential part of South Indian weddings and Golu displays.",
    price: 1999,
    category: "golu",
    images: ["/placeholder.svg"],
    featured: false,
    rating: 4.7,
    reviews: 98,
    inStock: true,
    tags: ["traditional"],
  },
  {
    id: "8",
    name: "Tanjore Painting Frame - Krishna",
    description: "Authentic Tanjore painting of Lord Krishna with real gold foil work. Handcrafted by master artisans from Thanjavur using centuries-old techniques.",
    price: 12999,
    originalPrice: 15999,
    category: "decor",
    images: ["/placeholder.svg"],
    featured: true,
    rating: 4.9,
    reviews: 34,
    inStock: true,
    tags: ["premium", "art"],
  },
];

export const testimonials = [
  { id: 1, name: "Priya Ramanathan", location: "Chennai", text: "The Golu set I ordered was absolutely stunning! Each doll was beautifully hand-painted. My family loved setting it up for Navaratri.", rating: 5 },
  { id: 2, name: "Lakshmi Venkatesh", location: "Bangalore", text: "Exceptional quality brass sculptures. The Ganesha statue is a masterpiece that now graces our pooja room. Highly recommended!", rating: 5 },
  { id: 3, name: "Meena Krishnan", location: "Coimbatore", text: "I've been ordering from KP Craft Shop for 3 years now. The quality and attention to detail is unmatched. Perfect for gifting too!", rating: 5 },
  { id: 4, name: "Ananya Sundaram", location: "Hyderabad", text: "The Tanjore painting exceeded my expectations. The gold foil work is exquisite and it arrived beautifully packaged.", rating: 5 },
];
