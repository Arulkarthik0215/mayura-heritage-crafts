# AWS S3 Image Upload & Product Creation Flow

This document outlines the complete lifecycle of an image upload in the Mayura Heritage Crafts application, from the moment an admin selects a file to the point it's saved in the database and displayed to customers.

## Step 1: The Admin Interface (Frontend)
**File:** `frontend/src/pages/admin/AdminProducts.tsx`

1. An admin clicks the "Upload" button (the dashed square with the `ImagePlus` icon) inside the "Add Product" or "Edit Product" modal.
2. They select one or more images from their computer.
3. This triggers the `handleImageUpload` function.
4. For each selected file, the function calls the `uploadImage` API helper.

## Step 2: The API Request (Frontend)
**File:** `frontend/src/lib/api.ts`

1. The `uploadImage` function wraps the raw file in a `FormData` object (which is the standard way to send files over HTTP).
2. It sends a `POST` request to the backend at `/api/upload` and attaches the admin's authentication token in the headers.

## Step 3: Receiving the File (Backend)
**File:** `backend/src/routes/upload.ts`

1. The backend route uses the `authMiddleware` to verify the admin is logged in.
2. It uses `multer` (a file-handling library) to intercept the request.
3. `multer` validates that the file is a permitted image type (JPEG, PNG, etc.) and under 10MB.
4. Instead of saving it to disk, `multer` holds the raw binary data (the "Buffer") in the server's RAM.

## Step 4: Pushing to AWS S3 (Backend)
**File:** `backend/src/lib/s3.ts`

1. The route handler passes the file's raw data to the `uploadToS3` function.
2. This function generates a random, unique ID (`UUID`) and combines it with the file's original extension to create a unique "Key" (e.g., `products/5f4dcc3b... .jpg`).
3. Using the `@aws-sdk/client-s3` library and credentials from the `.env` file, it issues a `PutObjectCommand` to AWS.
4. The image is securely stored in the `mayura-heritage-crafts` S3 bucket.
5. The function constructs the permanent public URL for this image (e.g., `https://mayura-heritage-crafts.s3.ap-south-1.amazonaws.com/products/...`) and returns it.

## Step 5: Returning to the Frontend
**File:** `backend/src/routes/upload.ts`

1. The backend route handler sends a JSON response back to the frontend containing the new S3 URL: `{ "url": "https://..." }`.

## Step 6: Updating the Form State (Frontend)
**File:** `frontend/src/pages/admin/AdminProducts.tsx`

1. The `handleImageUpload` function receives this URL.
2. It updates the React state `form.images`, adding the new URL to the list.
3. The UI immediately updates, showing a small thumbnail preview of the uploaded image inside the modal.

## Step 7: Saving the Product (Frontend to Backend)
**Files:** `frontend/src/pages/admin/AdminProducts.tsx` -> `frontend/src/lib/api.ts`

1. The admin finishes filling out the product name, price, etc., and clicks "Create Product".
2. This triggers the `handleSubmit` function.
3. It bundles all the form data—**crucially, including the array of S3 string URLs (`form.images`)**—into a JSON payload.
4. It calls `createProduct` (or `updateProduct`), which sends a `POST /api/products` request to the backend.

## Step 8: Database Storage (Backend)
**Files:** `backend/src/routes/products.ts` (and `backend/prisma/schema.prisma`)

1. The backend products route receives the JSON payload.
2. It uses Prisma ORM to insert a new row into the `Product` table in the PostgreSQL database.
3. Instead of storing a heavy image in the database, it simply stores the text strings (the AWS S3 URLs) inside the `images` column of that product's row.

## Step 9: Final Display (Frontend)
**Files:** e.g., `frontend/src/pages/ProductDetail.tsx` (Customer facing)

1. When a customer visits the website and opens a product, the frontend fetches that product's data from the database.
2. The database returns the product details, including the S3 URLs.
3. The frontend renders an HTML image tag: `<img src={product.images[0]} />`.
4. The customer's browser downloads the image directly from the lightning-fast AWS S3 servers, completely bypassing your backend server.
