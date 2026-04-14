# Mayura Heritage Crafts

An e-commerce platform for traditional South Indian heritage crafts — Golu dolls, brass sculptures, Tanjore paintings, and spiritual decor.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone & Install](#1-clone--install)
  - [2. Setup PostgreSQL Database](#2-setup-postgresql-database)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Run Database Migrations & Seed](#4-run-database-migrations--seed)
  - [5. Start the Application](#5-start-the-application)
- [AWS S3 Setup Guide](#aws-s3-setup-guide)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Products](#products)
  - [Categories](#categories)
  - [Testimonials](#testimonials)
  - [File Upload](#file-upload)
- [Database Schema](#database-schema)
- [Seed Data](#seed-data)
- [Available Scripts](#available-scripts)
- [What Has Been Done](#what-has-been-done)
- [What Needs to Be Done Next](#what-needs-to-be-done-next)

---

## Project Overview

This is a monorepo containing:

| Directory    | Description                                    |
|-------------|-----------------------------------------------|
| `frontend/` | Vite + React storefront (customer-facing site) |
| `backend/`  | Express + Prisma REST API (CMS backend)        |

The **backend** provides a complete REST API for managing products, categories, testimonials, and image uploads to AWS S3. It uses JWT-based authentication for admin-protected routes.

The **frontend** is the existing React storefront that currently uses hardcoded product data. It will eventually be connected to the backend API to display live data.

---

## Tech Stack

### Frontend
| Technology       | Purpose            |
|-----------------|--------------------|
| React 18        | UI library         |
| Vite 5          | Build tool & dev server |
| TypeScript      | Type safety        |
| TailwindCSS 3   | Styling            |
| shadcn/ui       | Component library  |
| React Router 6  | Client-side routing |
| TanStack Query  | Data fetching      |
| Framer Motion   | Animations         |

### Backend
| Technology       | Purpose                     |
|-----------------|-----------------------------|
| Node.js         | Runtime                     |
| Express 5       | HTTP server framework       |
| TypeScript      | Type safety                 |
| Prisma 7 (ORM)  | Database access & migrations |
| PostgreSQL      | Relational database         |
| JSON Web Tokens | Authentication              |
| AWS SDK v3      | S3 file uploads             |
| Multer          | Multipart form handling     |

---

## Project Structure

```
mayura-heritage-crafts/
├── .gitignore
├── package.json                  # Root monorepo config
│
├── frontend/                     # Vite + React storefront
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── index.html
│   ├── public/
│   └── src/
│       ├── App.tsx               # Main app with routes
│       ├── main.tsx              # Entry point
│       ├── components/           # Navbar, Footer, UI components
│       ├── pages/                # Index, Products, Cart, About, etc.
│       ├── data/products.ts      # Hardcoded product data (to be replaced)
│       ├── context/              # Cart context
│       └── hooks/
│
└── backend/                      # Express REST API
    ├── package.json
    ├── tsconfig.json
    ├── prisma.config.ts          # Prisma configuration
    ├── .env                      # Environment variables (git-ignored)
    ├── .env.example              # Template for .env
    │
    ├── prisma/
    │   └── schema.prisma         # Database schema definition
    │
    └── src/
        ├── index.ts              # Express server entry point
        ├── lib/
        │   ├── prisma.ts         # Prisma client singleton
        │   └── s3.ts             # AWS S3 upload/delete utilities
        ├── middleware/
        │   └── auth.ts           # JWT authentication middleware
        ├── routes/
        │   ├── auth.ts           # Login & profile routes
        │   ├── products.ts       # Product CRUD routes
        │   ├── categories.ts     # Category CRUD routes
        │   ├── testimonials.ts   # Testimonial CRUD routes
        │   └── upload.ts         # Image upload routes (S3)
        ├── scripts/
        │   └── seed.ts           # Database seed script
        └── generated/prisma/     # Auto-generated Prisma client (do not edit)
```

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool       | Version  | Installation                                        |
|-----------|----------|-----------------------------------------------------|
| Node.js   | >= 18    | [nodejs.org](https://nodejs.org/) or `brew install node` |
| npm       | >= 9     | Comes with Node.js                                  |
| PostgreSQL| >= 14    | `brew install postgresql@16` or use a cloud service  |

**Optional:**
- An **AWS account** (free tier works) for S3 image uploads
- [Neon.tech](https://neon.tech) as a free hosted PostgreSQL alternative

---

## Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd mayura-heritage-crafts

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup PostgreSQL Database

You have two options:

#### Option A: Local PostgreSQL (recommended for development)

```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create the database
createdb mayura_heritage
```

#### Option B: Cloud PostgreSQL (Neon.tech — free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project and database
3. Copy the connection string (it will look like `postgresql://user:password@host/dbname`)

### 3. Configure Environment Variables

```bash
cd backend

# Copy the example env file
cp .env.example .env
```

Now edit `backend/.env` with your actual values:

```env
# Database — replace with your actual PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mayura_heritage?schema=public"

# JWT — change this to a strong random string in production
JWT_SECRET="mayura-heritage-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
FRONTEND_URL="http://localhost:5173"

# AWS S3 — fill these in with your AWS credentials (see AWS S3 Setup Guide below)
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="mayura-heritage-crafts"
```

> **Note:** The AWS S3 variables are only needed when you want to use the image upload feature. The rest of the API (products CRUD, auth, etc.) works without them.

### 4. Run Database Migrations & Seed

```bash
cd backend

# Generate the Prisma client (already done, but run if you pull fresh)
npx prisma generate

# Create the database tables
npx prisma migrate dev --name init

# Seed the database with initial data
npm run seed
```

After seeding, the database will contain:
- 1 admin user
- 3 categories
- 8 products
- 4 testimonials

### 5. Start the Application

Open **two separate terminals**:

**Terminal 1 — Backend (API Server):**
```bash
cd backend
npm run dev
```
The API will run on **http://localhost:5000**

**Terminal 2 — Frontend (React App):**
```bash
cd frontend
npm run dev
```
The storefront will run on **http://localhost:5173**

**Verify the backend is running:**
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

## AWS S3 Setup Guide

Follow these steps to set up an S3 bucket for product image uploads.

### Step 1: Create an S3 Bucket

1. Login to the [AWS Console](https://console.aws.amazon.com/s3)
2. Click **Create Bucket**
3. Bucket name: `mayura-heritage-crafts` (or whatever you prefer)
4. Region: `ap-south-1` (Mumbai) — or your preferred region
5. Uncheck **"Block all public access"** (we need public read for images)
6. Acknowledge the warning and click **Create Bucket**

### Step 2: Set Bucket Policy (Public Read)

Go to your bucket → **Permissions** → **Bucket Policy** → Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mayura-heritage-crafts/*"
    }
  ]
}
```

> Replace `mayura-heritage-crafts` with your bucket name.

### Step 3: Enable CORS

Go to your bucket → **Permissions** → **CORS** → Paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:5000",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": []
  }
]
```

### Step 4: Create an IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam)
2. Click **Users** → **Create User**
3. User name: `mayura-s3-uploader`
4. Attach the policy `AmazonS3FullAccess` (or create a custom policy restricting to your bucket only)
5. Go to **Security credentials** → **Create access key** → Select **Application running outside AWS**
6. Copy the **Access Key ID** and **Secret Access Key**
7. Paste them into your `backend/.env`

---

## API Reference

**Base URL:** `http://localhost:5000`

### Authentication

| Method | Endpoint          | Auth   | Description              |
|--------|-------------------|--------|--------------------------|
| POST   | `/api/auth/login` | Public | Login and receive a JWT  |
| GET    | `/api/auth/me`    | Bearer | Get current user profile |

**Login Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mayura.com", "password": "admin123"}'
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@mayura.com",
    "name": "Mayura Admin",
    "role": "admin"
  }
}
```

**Using the token:** For all protected routes, include the token in the header:
```
Authorization: Bearer <token>
```

---

### Products

| Method | Endpoint              | Auth   | Description                         |
|--------|-----------------------|--------|-------------------------------------|
| GET    | `/api/products`       | Public | List all products                   |
| GET    | `/api/products/:id`   | Public | Get a single product by ID          |
| POST   | `/api/products`       | Bearer | Create a new product                |
| PUT    | `/api/products/:id`   | Bearer | Update an existing product          |
| DELETE | `/api/products/:id`   | Bearer | Delete a product                    |

**Query Filters (GET /api/products):**
```
GET /api/products?category=golu          # Filter by category
GET /api/products?featured=true          # Only featured products
GET /api/products?search=ganesha         # Search by name or description
```

**Create Product Body (POST):**
```json
{
  "name": "New Brass Diya",
  "description": "Handcrafted brass oil lamp",
  "price": 999,
  "originalPrice": 1299,
  "category": "decor",
  "images": ["https://s3-url/image1.jpg"],
  "featured": true,
  "inStock": true,
  "tags": ["new", "festive"]
}
```

---

### Categories

| Method | Endpoint                | Auth   | Description          |
|--------|-------------------------|--------|----------------------|
| GET    | `/api/categories`       | Public | List all categories  |
| POST   | `/api/categories`       | Bearer | Create a category    |
| PUT    | `/api/categories/:id`   | Bearer | Update a category    |
| DELETE | `/api/categories/:id`   | Bearer | Delete a category    |

---

### Testimonials

| Method | Endpoint                  | Auth   | Description            |
|--------|---------------------------|--------|------------------------|
| GET    | `/api/testimonials`       | Public | List all testimonials  |
| POST   | `/api/testimonials`       | Bearer | Create a testimonial   |
| DELETE | `/api/testimonials/:id`   | Bearer | Delete a testimonial   |

---

### File Upload

| Method | Endpoint                | Auth   | Description                     |
|--------|-------------------------|--------|---------------------------------|
| POST   | `/api/upload`           | Bearer | Upload a single image to S3     |
| POST   | `/api/upload/multiple`  | Bearer | Upload multiple images to S3    |
| DELETE | `/api/upload`           | Bearer | Delete an image from S3         |

**Upload Single Image:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/photo.jpg"
```

**Response:**
```json
{
  "url": "https://mayura-heritage-crafts.s3.ap-south-1.amazonaws.com/products/uuid.jpg"
}
```

**Upload Multiple Images:**
```bash
curl -X POST http://localhost:5000/api/upload/multiple \
  -H "Authorization: Bearer <token>" \
  -F "images=@/path/to/photo1.jpg" \
  -F "images=@/path/to/photo2.jpg"
```

**Delete an Image:**
```bash
curl -X DELETE http://localhost:5000/api/upload \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://mayura-heritage-crafts.s3.ap-south-1.amazonaws.com/products/uuid.jpg"}'
```

---

## Database Schema

```
┌──────────────────┐     ┌──────────────────────┐
│      User        │     │       Product         │
├──────────────────┤     ├──────────────────────┤
│ id        (UUID) │     │ id            (UUID)  │
│ email    (unique)│     │ name                  │
│ password         │     │ description           │
│ name             │     │ price         (Float) │
│ role             │     │ originalPrice (Float?)│
│ createdAt        │     │ category              │
│ updatedAt        │     │ images[]              │
└──────────────────┘     │ featured      (Bool)  │
                         │ rating        (Float) │
┌──────────────────┐     │ reviews       (Int)   │
│    Category      │     │ inStock       (Bool)  │
├──────────────────┤     │ tags[]                │
│ id        (UUID) │     │ createdAt             │
│ slug     (unique)│     │ updatedAt             │
│ name             │     └──────────────────────┘
│ description      │
│ icon             │     ┌──────────────────────┐
└──────────────────┘     │    Testimonial        │
                         ├──────────────────────┤
                         │ id        (UUID)      │
                         │ name                  │
                         │ location              │
                         │ text                  │
                         │ rating       (Int)    │
                         └──────────────────────┘
```

You can visually explore the database using Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

---

## Seed Data

The seed script (`npm run seed`) populates the database with:

| Entity      | Count | Details                                            |
|-------------|-------|----------------------------------------------------|
| Admin User  | 1     | `admin@mayura.com` / `admin123`                    |
| Categories  | 3     | Golu Dolls, Sculptures, Spiritual Decor            |
| Products    | 8     | Full catalog with prices, ratings, and descriptions |
| Testimonials| 4     | Customer reviews from Chennai, Bangalore, etc.     |

> ⚠️ The admin password is stored in **plain text** for the MVP. Replace with bcrypt hashing before going to production.

---

## Available Scripts

### Backend (`cd backend`)

| Command                | Description                                    |
|-----------------------|------------------------------------------------|
| `npm run dev`         | Start dev server with hot-reload (nodemon)     |
| `npm run build`       | Compile TypeScript to `dist/`                  |
| `npm start`           | Run compiled production build                  |
| `npm run seed`        | Seed the database with initial data            |
| `npm run prisma:generate` | Re-generate the Prisma client             |
| `npm run prisma:migrate`  | Run database migrations                   |
| `npm run prisma:studio`   | Open Prisma Studio (visual DB browser)    |

### Frontend (`cd frontend`)

| Command                | Description                          |
|-----------------------|--------------------------------------|
| `npm run dev`         | Start Vite dev server on port 5173   |
| `npm run build`       | Build for production                 |
| `npm run preview`     | Preview the production build locally |
| `npm run lint`        | Run ESLint                           |
| `npm run test`        | Run Vitest tests                     |

---

## What Has Been Done

### ✅ Phase 1 — Repository Restructuring
- Reorganized into monorepo: `frontend/` + `backend/`
- Created root `package.json` and `.gitignore`

### ✅ Phase 2 — Backend Setup
- Initialized Node.js project with TypeScript
- Installed all required dependencies (Express, Prisma, AWS SDK, JWT, Multer)
- Configured `tsconfig.json` for strict TypeScript compilation
- Defined Prisma schema with 4 models (User, Product, Category, Testimonial)
- Set up Prisma with the `@prisma/adapter-pg` driver adapter (Prisma v7 requirement)
- Created database seed script with all existing product data

### ✅ Phase 3 — REST API & S3 Integration
- Built JWT authentication middleware
- Implemented full CRUD routes for Products, Categories, and Testimonials
- Built the AWS S3 upload utility (single/multiple file upload + delete)
- Protected all write operations with JWT Bearer token auth
- All TypeScript compiles with **zero errors**

---

## What Needs to Be Done Next

### 🔲 Phase 4 — Frontend Admin CMS
- Build `/login` page in React connecting to `POST /api/auth/login`
- Create admin dashboard layout at `/admin`
- Build product management UI (list, create, edit, delete)
- Integrate image upload with the S3 upload API
- Add protected route wrapper for admin pages

### 🔲 Phase 5 — Connect Storefront to Backend
- Replace hardcoded `frontend/src/data/products.ts` with API calls
- Use TanStack Query to fetch products from `GET /api/products`
- Load categories and testimonials from the backend API

### 🔲 Future Improvements
- Replace plain text admin password with bcrypt hashing
- Add real user registration and role-based access control
- Add order management system
- Configure CloudFront CDN in front of S3 for faster image delivery
- Add rate limiting and input validation with Zod
- Deploy backend to AWS (ECS/EC2) or Render
- Set up CI/CD pipeline

---

## Troubleshooting

### "Cannot find module '@prisma/client'" error
```bash
cd backend && npx prisma generate
```

### "Connection refused" for PostgreSQL
Make sure PostgreSQL is running:
```bash
brew services start postgresql@16
```

### "CORS error" when frontend calls backend
Check that `FRONTEND_URL` in `backend/.env` matches your frontend URL (default `http://localhost:5173`).

### Prisma migrate fails with "database does not exist"
Create the database first:
```bash
createdb mayura_heritage
```
