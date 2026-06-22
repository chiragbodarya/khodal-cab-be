# Team Task Tracker API (SDE-II Assignment) 🐳

This is a production-ready REST API for a team-based task tracker system with role-based access control, security encryptions, Winston logs, Redis caching, and containerized deployment.

---

## 🚀 Setup & Installation (One-Command Start)

You only need **Docker Desktop** installed to start the entire system (including PostgreSQL and Redis).

### 1. Run the system
In your terminal inside the project directory, run:
```bash
docker compose up --build
```
*This downloads PostgreSQL, Redis, builds the Node.js application, and boots them up connected under a private network.*

### 2. Generate Database Tables (First-time setup only)
Open a **new terminal window** in the same directory and execute:
```bash
docker compose exec app npx prisma db push
```
*This pushes our relational database schema and SDE-II indexes directly into the running PostgreSQL container.*

### 3. Bootstrap your initial Admin User
To register your very first `ADMIN` user, send a POST request using Postman to:
* **Endpoint**: `POST http://localhost:9000/api/v1/auth/bootstrap-admin`
* **Body (JSON)**:
  ```json
  {
    "email": "admin@gmail.com",
    "password": "secureadminpass",
    "role": "ADMIN",
    "organizationName": "Acme Corp"
  }
  ```

---

## 🔑 Security & Authorization Structure

This application enforces strict role-based access control (RBAC) at the middleware level in `src/middlewares/auth.js`:
* **`ADMIN`**: Full permissions across the organization (creates Projects, Tasks, and registers new Users).
* **`MANAGER`**: Manages tasks, projects, and assigns members. Cannot manage/register users.
* **`MEMBER`**: Can only view and update tasks specifically assigned to them.
* **JWT Refresh Token Rotation (RTR):** Protects against session replay hijacking. The database stores active refresh tokens. When the user requests a new access token, the system validates the refresh token, deletes it, and issues a brand-new rotated pair.

---

## ⚡ Caching Strategy & Invalidation

To maintain optimal response times, we implement **Redis caching** in `src/config/redis.js` and `src/controllers/taskController.js`:
1. **Assignee Caching**: Task lists queried per assignee are cached under the key `tasks:assignee:<assigneeId>`.
2. **Active Invalidation**: Whenever a Task is created, updated (status, assignee, priority), or deleted, the server identifies the assignee and immediately invalidates their specific cache key. This ensures data is always kept consistent and up-to-date while avoiding stale responses.

---

## 📊 Database Design Decisions & Indexing

To meet high-performance standards, we placed index locks on frequently queried fields in our `Task` model:
* **`status`**: Critical since task boards fetch cards matching distinct statuses (e.g. `TODO`, `IN_PROGRESS`).
* **`assigneeId`**: Speeds up user dashboard page loads which fetch tasks specific to the logged-in user.
* **`due_date`**: Crucial for calculating overdue tasks efficiently during analytics aggregates without triggering costly full-table scans.

---

## 💾 Manual PostgreSQL Table Creation (PGAdmin Option)

If you prefer to create tables manually inside PGAdmin rather than letting Prisma sync it, open the **Query Tool** inside PGAdmin and execute the script found in:
👉 **[schema.sql](file:///d:/vs%20code/github/task-manager-BE/schema.sql)**

---

## 📡 Server-Sent Events (SSE) Real-Time Streams

To build an event-driven architecture with zero extra dependencies, we leverage native HTTP **Server-Sent Events (SSE)** under:
* **`GET /api/v1/notifications/stream`** (Protected)
* Connects a persistent HTTP channel. Users receive instant notifications when:
  - Their assigned task status is changed.
  - They are `@mentioned` in task comments (e.g. writing a comment `@john welcome!` immediately pushes an SSE notification to user `john`).

---

## 📈 SDE-II Analytics Aggregate

* **`GET /api/v1/analytics/tasks`** (Admin Only):
  - Fetches total overdue task counts grouped per user.
  - Fetches the average completion time (in hours) calculated from completed tasks (`completedAt - createdAt`) using raw SQL aggregates.

---

## 🔮 What I Would Improve Given More Time
1. **Dynamic Permission Mapping:** Move from simple hardcoded role checks to a database table storing dynamic permissions per role.
2. **Rate Limiting Whitelist:** Configure dynamic rate-limit thresholds for VIP users vs. public callers.
