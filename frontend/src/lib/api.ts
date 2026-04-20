/**
 * REST API helper — all admin requests to the Express backend go through here.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  return localStorage.getItem("admin_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || "Something went wrong");
  }
  return res.json();
}

/* ─── Auth ─── */
export async function loginAdmin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ token: string; user: { id: string; email: string; name: string; role: string } }>(res);
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...authHeaders() },
  });
  return handleResponse<{ user: { id: string; email: string; name: string; role: string } }>(res);
}

/* ─── Products ─── */
export async function fetchProducts(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_BASE}/products${query}`);
  return handleResponse<{ products: any[] }>(res);
}

export async function fetchProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  return handleResponse<{ product: any }>(res);
}

export async function createProduct(data: any) {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<{ product: any }>(res);
}

export async function updateProduct(id: string, data: any) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<{ product: any }>(res);
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse<{ message: string }>(res);
}

/* ─── Categories ─── */
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  return handleResponse<{ categories: any[] }>(res);
}

export async function createCategory(data: any) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<{ category: any }>(res);
}

export async function updateCategory(id: string, data: any) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<{ category: any }>(res);
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse<{ message: string }>(res);
}

/* ─── Testimonials ─── */
export async function fetchTestimonials() {
  const res = await fetch(`${API_BASE}/testimonials`);
  return handleResponse<{ testimonials: any[] }>(res);
}

export async function createTestimonial(data: any) {
  const res = await fetch(`${API_BASE}/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse<{ testimonial: any }>(res);
}

export async function deleteTestimonial(id: string) {
  const res = await fetch(`${API_BASE}/testimonials/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse<{ message: string }>(res);
}

/* ─── Upload ─── */
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  return handleResponse<{ url: string }>(res);
}

export async function uploadMultipleImages(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  const res = await fetch(`${API_BASE}/upload/multiple`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: formData,
  });
  return handleResponse<{ urls: string[] }>(res);
}

export async function deleteImage(url: string) {
  const res = await fetch(`${API_BASE}/upload`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ url }),
  });
  return handleResponse<{ message: string }>(res);
}
