# Infrastructure & Deployment Guide
**Mayura Heritage Crafts**

This document serves as a complete reference for how the web infrastructure is configured. It outlines the step-by-step setup of the Database, Image Storage, Backend API, and Frontend application.

## 🛠 Tech Stack Overview
1. **Frontend:** React (Vite), TailwindCSS, Framer Motion
2. **Backend:** Node.js, Express, Prisma ORM
3. **Database:** PostgreSQL (Hosted on Supabase)
4. **Image Storage:** AWS S3
5. **Hosting:** Vercel (Frontend) & Render (Backend)

---

## 1. AWS S3 Setup (Image Hosting)
Instead of saving product uploads directly onto the backend server (which is wiped during deployments), all images uploaded via the Admin CMS are sent to AWS S3.

### Initial Setup Process:
1. Created an S3 Bucket named `mayura-heritage-crafts` in the `ap-south-1` (Mumbai) region.
2. Disabled "Block all public access" to ensure images can be viewed globally on the storefront.
3. Attached a **Bucket Policy** allowing public `s3:GetObject` access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::[BUCKET-NAME]/*"
       }
     ]
   }
   ```
4. **CORS Configuration:** Enabled CORS to allow `GET`, `PUT`, `POST`, `DELETE` from `*` or specific domains.
5. Created an **IAM User** in AWS with `AmazonS3FullAccess` to securely upload and delete images programmatically. Generates Access Keys.

### 🔄 How to Change to a Client's AWS Account
When handing the project over to a client, you need to switch the AWS infrastructure so images are stored on their bill.

1. **Ask the client to create an AWS Account.**
2. **Follow Steps 1-5 above on the client's AWS account** to create a new Bucket and a new IAM user.
3. The client will provide you with **4 pieces of information**:
   - The new Bucket Name
   - The Region it was created in (e.g. `ap-south-1`)
   - The IAM `AWS_ACCESS_KEY_ID`
   - The IAM `AWS_SECRET_ACCESS_KEY`
4. **Update Render:** Go to your Render Backend dashboard -> **Environment Variables**. Replace the 4 existing AWS variables with the new ones provided by the client.
5. **Click "Manual Deploy"** on Render.
6. *Any new images uploaded from the Admin panel will now go directly to the client's AWS S3 bucket!*

---

## 2. Database Setup (Supabase PostgreSQL)
The application uses Supabase to host the completely free, managed PostgreSQL database.

### The IPv4 Pooler Solution:
Because Supabase removed IPv4 support for direct database connections on their free tier, local internet providers without IPv6 cannot natively connect to the database. We solved this using the **Supabase Session Pooler**.

We utilize *two* distinct connection strings:
1. **`DATABASE_URL` (Port 6543):** Uses the Transaction Pooler (PgBouncer). This acts as a receptionist to efficiently funnel thousands of requests into the database without crashing it. *Used by the live app.*
2. **`DIRECT_URL` (Port 5432):** Uses the Session Pooler. This acts as an IPv4 proxy specifically for running Database structural migrations (which PgBouncer normally blocks). *Used only when modifying the database schema.*

**Deployment Commands:**
Whenever updating the `schema.prisma` file, the following is run via terminal overriding the environment to use the Direct URL:
```bash
$env:DATABASE_URL="postgresql://postgres.[id]:[pass]@aws-1.pooler.supabase.com:5432/postgres"; npx prisma migrate deploy
```

---

## 3. Backend Deployment (Render)
The Express backend is deployed as a Web Service on Render. Since Render automatically pulls code from the GitHub repository, it recompiles and restarts whenever new backend code is pushed.

### Render Configuration:
- **Root Directory:** `backend` (Critical, so Render knows not to build the frontend).
- **Build Command:** 
  ```bash
  npm install && npx prisma generate && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```
- **Environment Variables:** All variables from the local `backend/.env` (Database strings, AWS keys, and `JWT_SECRET`) are copied into the Render dashboard.

---

## 4. Frontend Deployment (Vercel)
The React/Vite frontend is deployed globally via Vercel. 

### Vercel Configuration:
- Vercel automatically detects Vite configurations when connected to the GitHub repo.
- **Environment Variable:** `VITE_API_URL` is mapped to the Render backend URL (e.g., `https://mayura-backend.onrender.com/api`).
- **Important Fix (`vercel.json`):** Because the app is a Single Page Application (SPA) using React Router, we added a `vercel.json` file. Without this file, navigating directly to `/admin` would result in a `404 Not Found` error. The `vercel.json` intercepts all URL paths and rewrites them to `index.html`.

--- 
*This infrastructure ensures the site scales beautifully, remains secure, and runs almost entirely for free on modern cloud platforms.*
