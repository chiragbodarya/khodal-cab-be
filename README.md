# Khodal Cab Backend API 🚕

A production-ready REST API backend for **Khodal Cab** built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

---

## 🚀 Key Features

* **Admin Authentication & Token Management**: JWT authentication with refresh tokens and bcrypt password hashing.
* **Vehicle Fleet Management**: CRUD operations for cars, SUVs, tempos, and seating configurations.
* **Cab Plans & Route Packages**: Management of city-to-city routes, pricing, and driver inclusions.
* **Tour Packages**: Curated holiday itineraries with duration, route stops, and pricing.
* **Inquiry & Booking Lead System**: Full lifecycle inquiry management with status workflows, follow-up dates, and internal admin notes.
* **Blog & Travel Guides**: Content management system for articles with slugs and tags.
* **Image Gallery & File Uploads**: Media management with Multer static storage.

---

## 🛠️ Tech Stack

* **Runtime**: Node.js & TypeScript
* **Framework**: Express 5
* **ORM & Database**: Prisma ORM with PostgreSQL
* **Security & Auth**: JWT, bcrypt, helmet, cors
* **File Uploads**: Multer
* **Logging**: Morgan & Winston

---

## 📦 Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
PORT=9000
DATABASE_URL="postgresql://username:password@localhost:5432/khodal_cab_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
```

### 3. Setup Database Schema
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# (Optional) Seed initial data
npx tsx prisma/seed.ts
```

### 4. Start Development Server
```bash
npm run dev
```
The API server will run at `http://localhost:9000/api/v1`.

---

## 📑 API Endpoints Reference

### 1. Health Check
* `GET /api/v1/health` - Server health status

### 2. Admin Authentication (`/api/v1/admin`)
* `POST /api/v1/admin/login` - Admin login (returns tokens & cookie)
* `POST /api/v1/admin/refresh` - Refresh access token
* `POST /api/v1/admin/logout` - Logout & revoke refresh token
* `GET /api/v1/admin/me` - Get logged-in admin profile
* `GET /api/v1/admin/list` - List all admins (Admin only)
* `POST /api/v1/admin/create` - Create a new admin (Admin only)
* `DELETE /api/v1/admin/:id` - Delete admin (Admin only)

### 3. Vehicles (`/api/v1/vehicles`)
* `GET /api/v1/vehicles` - List active vehicles (Public)
* `GET /api/v1/vehicles/admin/list` - List all vehicles (Admin)
* `POST /api/v1/vehicles` - Create vehicle (Admin)
* `PATCH /api/v1/vehicles/:id` - Update vehicle (Admin)
* `DELETE /api/v1/vehicles/:id` - Delete vehicle (Admin)

### 4. Cab Plans (`/api/v1/cab-plans`)
* `GET /api/v1/cab-plans` - List active cab plans (Public)
* `GET /api/v1/cab-plans/admin/list` - List all cab plans (Admin)
* `POST /api/v1/cab-plans` - Create cab plan (Admin)
* `PATCH /api/v1/cab-plans/:id` - Update cab plan (Admin)
* `DELETE /api/v1/cab-plans/:id` - Delete cab plan (Admin)

### 5. Tour Plans (`/api/v1/tour-plans`)
* `GET /api/v1/tour-plans` - List active tour plans (Public)
* `GET /api/v1/tour-plans/admin/list` - List all tour plans (Admin)
* `POST /api/v1/tour-plans` - Create tour plan (Admin)
* `PATCH /api/v1/tour-plans/:id` - Update tour plan (Admin)
* `DELETE /api/v1/tour-plans/:id` - Delete tour plan (Admin)

### 6. Inquiries & Contact (`/api/v1/inquiries`)
* `POST /api/v1/inquiries` - Submit customer inquiry (Public)
* `GET /api/v1/inquiries/admin/list` - Filtered inquiry list with pagination (Admin)
* `GET /api/v1/inquiries/admin/stats` - Inquiry metrics & KPIs (Admin)
* `GET /api/v1/inquiries/admin/:id` - Get inquiry details (Admin)
* `PATCH /api/v1/inquiries/admin/:id` - Update inquiry status, follow-up, admin notes (Admin)
* `DELETE /api/v1/inquiries/admin/:id` - Delete inquiry (Admin)

### 7. Blogs (`/api/v1/blogs`)
* `GET /api/v1/blogs` - List published blogs (Public)
* `GET /api/v1/blogs/:slug` - Get blog by slug (Public)
* `GET /api/v1/blogs/admin/list` - List all blogs (Admin)
* `POST /api/v1/blogs` - Create blog post (Admin)
* `PATCH /api/v1/blogs/:id` - Update blog post (Admin)
* `DELETE /api/v1/blogs/:id` - Delete blog post (Admin)

### 8. Gallery (`/api/v1/gallery`)
* `GET /api/v1/gallery` - List gallery images (Public)
* `GET /api/v1/gallery/admin/list` - List all gallery items (Admin)
* `POST /api/v1/gallery` - Add image to gallery (Admin)
* `DELETE /api/v1/gallery/:id` - Remove image from gallery (Admin)

### 9. File Uploads (`/api/v1/upload`)
* `POST /api/v1/upload` - Upload image file (Admin)
