# Task Manager Backend 🚀

A structured, clean, and developer-friendly Node.js Express backend using Prisma ORM and PostgreSQL.

---

## 🛠️ How to Run the Project (Docker Guide)

Depending on whether you have existing containers or are starting fresh, follow the instructions below:

### Scenario 1: You cleared/deleted your Docker Desktop images & containers (Fresh Run)
If you deleted the container/image and need to rebuild everything from scratch, run these commands:

1. **Step 1: Build and boot up the containers**
   ```bash
   docker compose up --build
   ```
   *This downloads PostgreSQL, builds your Node app container, and starts both. Keep this terminal open.*

2. **Step 2: Initialize/Push your database schema (In a NEW terminal window)**
   ```bash
   docker compose exec app npx prisma db push
   ```
   *This pushes the `Task` table design directly into the Docker PostgreSQL container.*

---

### Scenario 2: Images and containers already exist in Docker Desktop
If you already ran Scenario 1 and just want to start the app again to continue working:

1. **Run the start command**
   ```bash
   docker compose up
   ```
   *Since the image is already built and the database container exists, this starts everything instantly in 2 seconds!*

---

## 🔑 Database Password Details (Important!)

In your setup, you have **two separate databases** you can use:

1. **The Docker Container Database (`docker-compose.yml`)**:
   - The password inside `docker-compose.yml` is `taskpassword123`.
   - **What is this?** This password is created exclusively for the isolated PostgreSQL database running inside the Docker container. It does NOT touch your computer's local Postgres.
   
2. **Your Windows Local Database (`.env` Option A)**:
   - **What is this?** This is your personal PostgreSQL database (`task-manager-db`) installed directly on your Windows PC.
   - You must replace `your_password_here` inside the `.env` file with the **actual password** you set up when you installed PostgreSQL on your Windows system.
