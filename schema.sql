-- =========================================================================
-- TRAVEL COMPANY SYSTEM SCHEMA DEFINITION (POSTGRESQL)
-- =========================================================================

-- 1. Create Admin Table
CREATE TABLE "Admin" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create AdminRefreshToken Table
CREATE TABLE "AdminRefreshToken" (
    "id" SERIAL PRIMARY KEY,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "adminId" INTEGER NOT NULL REFERENCES "Admin"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Vehicle Table
CREATE TABLE "Vehicle" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "features" TEXT[] NOT NULL DEFAULT '{}',
    "licensePlate" VARCHAR(255),
    "images" TEXT[] NOT NULL DEFAULT '{}',
    "status" VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create TravelPlan Table
CREATE TABLE "TravelPlan" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "destination" VARCHAR(255) NOT NULL,
    "origin" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "duration" VARCHAR(255) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "departureTime" TIMESTAMP(3),
    "itinerary" JSONB,
    "highlights" TEXT[] NOT NULL DEFAULT '{}',
    "images" TEXT[] NOT NULL DEFAULT '{}',
    "vehicleId" INTEGER REFERENCES "Vehicle"("id") ON DELETE SET NULL,
    "status" VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Blog Table
CREATE TABLE "Blog" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "coverImage" VARCHAR(511),
    "tags" TEXT[] NOT NULL DEFAULT '{}',
    "published" BOOLEAN NOT NULL DEFAULT FALSE,
    "publishedAt" TIMESTAMP(3),
    "adminId" INTEGER NOT NULL REFERENCES "Admin"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Indexes for optimization
CREATE INDEX "AdminRefreshToken_token_idx" ON "AdminRefreshToken"("token");
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");
CREATE INDEX "TravelPlan_vehicleId_idx" ON "TravelPlan"("vehicleId");
