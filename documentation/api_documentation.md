# Mayura Heritage Crafts - API Documentation

This document provides a simple, easy-to-understand breakdown of all the backend APIs (Application Programming Interfaces) used in the application.

These APIs act as messengers, carrying requests from the frontend (the user interface) to the backend (the database and logic) and returning the responses.

---

## 1. Authentication APIs (`/api/auth`)
These endpoints handle user login and security, ensuring only authorized administrators can access protected parts of the application.

*   **`POST /api/auth/login`**
    *   **Description:** Takes an email and password to authenticate a user. If credentials are correct, it returns a secure token (JWT) needed for admin tasks.
    *   **Source:** `backend/src/routes/auth.ts`
*   **`GET /api/auth/me`**
    *   **Description:** Uses the secure token to verify the current session and returns the profile details of the currently logged-in user.
    *   **Source:** `backend/src/routes/auth.ts`

---

## 2. Products APIs (`/api/products`)
These endpoints manage the store's inventory of crafts and idols.

*   **`GET /api/products`**
    *   **Description:** Retrieves a list of all products. Supports filtering by category, searching by keywords, or fetching featured products.
    *   **Source:** `backend/src/routes/products.ts`
*   **`GET /api/products/:id`**
    *   **Description:** Gets the full, detailed information for a single specific product using its ID.
    *   **Source:** `backend/src/routes/products.ts`
*   **`POST /api/products`** *(Admin Only)*
    *   **Description:** Allows the admin to create and add a brand new product to the store's inventory.
    *   **Source:** `backend/src/routes/products.ts`
*   **`PUT /api/products/:id`** *(Admin Only)*
    *   **Description:** Updates an existing product's details (e.g., price, description, stock status).
    *   **Source:** `backend/src/routes/products.ts`
*   **`DELETE /api/products/:id`** *(Admin Only)*
    *   **Description:** Completely removes a product from the database.
    *   **Source:** `backend/src/routes/products.ts`

---

## 3. Orders & Payments APIs (`/api/orders`)
These endpoints handle the checkout process and track customer purchases.

*   **`POST /api/orders`**
    *   **Description:** Creates a new customer order during checkout. Calculates shipping, stores address details, and initiates a secure payment request with Razorpay.
    *   **Source:** `backend/src/routes/orders.ts`
*   **`POST /api/orders/verify`**
    *   **Description:** After a customer completes a Razorpay payment, this verifies the payment's cryptographic signature to guarantee success before marking the order as "Paid".
    *   **Source:** `backend/src/routes/orders.ts`
*   **`GET /api/orders/admin`** *(Admin Only)*
    *   **Description:** Retrieves a complete list of all customer orders for the admin to review and fulfill.
    *   **Source:** `backend/src/routes/orders.ts`
*   **`GET /api/orders/admin/stats`** *(Admin Only)*
    *   **Description:** Calculates statistics for the admin dashboard, such as total sales revenue and the number of paid orders.
    *   **Source:** `backend/src/routes/orders.ts`
*   **`PUT /api/orders/admin/:id`** *(Admin Only)*
    *   **Description:** Updates the status of an order (e.g., changing from "Processing" to "Shipped") and allows adding tracking numbers.
    *   **Source:** `backend/src/routes/orders.ts`

---

## 4. Categories APIs (`/api/categories`)
These endpoints manage how products are grouped.

*   **`GET /api/categories`**
    *   **Description:** Retrieves all product categories (e.g., "Sculptures", "Pooja Items") to display on the frontend.
    *   **Source:** `backend/src/routes/categories.ts`
*   **`POST /api/categories`** *(Admin Only)*
    *   **Description:** Creates a new product category.
    *   **Source:** `backend/src/routes/categories.ts`
*   **`PUT /api/categories/:id`** *(Admin Only)*
    *   **Description:** Updates an existing category's name, description, or icon.
    *   **Source:** `backend/src/routes/categories.ts`
*   **`DELETE /api/categories/:id`** *(Admin Only)*
    *   **Description:** Deletes a specific category.
    *   **Source:** `backend/src/routes/categories.ts`

---

## 5. Settings APIs (`/api/settings`)
These endpoints control the dynamic text and contact information across the website.

*   **`GET /api/settings`**
    *   **Description:** Retrieves global website settings, such as the site name, contact email, phone number, and "About Us" text.
    *   **Source:** `backend/src/routes/settings.ts`
*   **`PUT /api/settings`** *(Admin Only)*
    *   **Description:** Allows the admin to update global website details directly from the dashboard.
    *   **Source:** `backend/src/routes/settings.ts`

---

## 6. Testimonials APIs (`/api/testimonials`)
These endpoints manage customer reviews.

*   **`GET /api/testimonials`**
    *   **Description:** Fetches all customer reviews to showcase on the public website.
    *   **Source:** `backend/src/routes/testimonials.ts`
*   **`POST /api/testimonials`** *(Admin Only)*
    *   **Description:** Adds a new customer testimonial to the site.
    *   **Source:** `backend/src/routes/testimonials.ts`
*   **`DELETE /api/testimonials/:id`** *(Admin Only)*
    *   **Description:** Removes a testimonial from the website.
    *   **Source:** `backend/src/routes/testimonials.ts`

---

## 7. Upload APIs (`/api/upload`)
These endpoints handle the safe storage of images in the cloud.

*   **`POST /api/upload`** *(Admin Only)*
    *   **Description:** Uploads a single image file to secure cloud storage (AWS S3) and returns the public web link.
    *   **Source:** `backend/src/routes/upload.ts`
*   **`POST /api/upload/multiple`** *(Admin Only)*
    *   **Description:** Uploads several image files at once to AWS S3, returning a list of their web links.
    *   **Source:** `backend/src/routes/upload.ts`
*   **`DELETE /api/upload`** *(Admin Only)*
    *   **Description:** Deletes an image from cloud storage by its URL to free up space.
    *   **Source:** `backend/src/routes/upload.ts`
