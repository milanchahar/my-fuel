# MyFuels — Fuel Order Management System

A full-stack web application built as part of the My Fuels internship technical assessment. The system lets users place fuel delivery orders and track them through the entire fulfillment cycle, while giving admins a dedicated panel to manage and update order statuses.

**Demo Video:** [https://drive.google.com/file/d/1vIhzbKFDenhMVi__ZiH46C_KI-iLPtxt/view?usp=sharing](#)

**Live Demo:** [https://myfuels.vercel.app/login](#)

**GitHub:** [github.com/milanchahar/my-fuel](https://github.com/milanchahar/my-fuel)

---

## What it does

The application covers the complete order lifecycle — from a user signing up and placing a fuel delivery request, to an admin accepting it, dispatching it, and marking it delivered. There are two separate experiences: one for end users and one for admins, both protected by JWT-based authentication.

**User side**
- Register and log in securely
- Place fuel orders (fuel type, quantity, delivery location, preferred delivery time)
- View personal order history
- Track current order status in real time

**Admin side**
- View all incoming orders across users
- Filter and search through orders
- Update order status at each stage of fulfillment

**Order status flow:** `Pending` → `Accepted` → `Out for Delivery` → `Delivered`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Axios, Tailwind CSS, React Hot Toast |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Hosting | MongoDB Atlas |

---

## ER Diagram

```
┌─────────────────────────────┐         ┌──────────────────────────────────────┐
│           USER              │         │               ORDER                  │
├─────────────────────────────┤         ├──────────────────────────────────────┤
│ _id          ObjectId (PK)  │◄────────│ userId       ObjectId (FK → User)    │
│ name         String         │  1   N  │ _id          ObjectId (PK)           │
│ email        String (unique)│         │ fuelType     String                  │
│ password     String (hashed)│         │ quantity     Number                  │
│ role         String         │         │ deliveryLocation  String             │
│              (user/admin)   │         │ preferredTime     String             │
│ createdAt    Date           │         │ status       String                  │
└─────────────────────────────┘         │              (Pending/Accepted/      │
                                        │               Out for Delivery/      │
                                        │               Delivered)             │
                                        │ createdAt    Date                    │
                                        │ updatedAt    Date                    │
                                        └──────────────────────────────────────┘
```

**Relationships**
- One `User` can have many `Orders` (one-to-many)
- Each `Order` belongs to exactly one `User` via `userId` foreign key
- Role field on `User` determines access level — `user` or `admin`

---

## Architecture

```
┌──────────────────────────────┐
│     Client (React + Vite)    │
│  Port: 5173                  │
└──────────────┬───────────────┘
               │
               │  HTTP requests with Bearer Token (Axios)
               │
┌──────────────▼───────────────┐
│   Express API (Node.js)      │
│   Port: 5000                 │
│                              │
│  ┌─────────┐  ┌───────────┐  │
│  │  Auth   │  │  Orders   │  │
│  │ Routes  │  │  Routes   │  │
│  └────┬────┘  └─────┬─────┘  │
│       │             │        │
│  ┌────▼─────────────▼─────┐  │
│  │  Controllers / Logic   │  │
│  └────────────┬───────────┘  │
│               │              │
│  ┌────────────▼───────────┐  │
│  │  JWT Middleware        │  │
│  │  Admin Check           │  │
│  └────────────┬───────────┘  │
└───────────────┼──────────────┘
                │
                │  Mongoose ODM
                │
┌───────────────▼──────────────┐
│        MongoDB Atlas         │
│                              │
│  Collections: users, orders  │
└──────────────────────────────┘
```

**Request flow**
1. React frontend makes an API call with an `Authorization: Bearer <token>` header
2. Express receives the request and runs it through JWT middleware for protected routes
3. If the route requires admin access, a secondary middleware checks the user's role
4. The controller runs the business logic and queries MongoDB via Mongoose
5. Response is sent back and rendered in the UI

---

## Project Structure

```
myfuels/
├── client/
│   └── src/
│       ├── api/              # Axios instance with base URL and interceptors
│       ├── components/       # Navbar, ProtectedRoute
│       ├── context/          # AuthContext for global auth state
│       └── pages/            # Login, Register, Dashboard, Orders, Admin Panel
│
├── server/
│   ├── controllers/          # Auth logic, Order CRUD operations
│   ├── middleware/            # JWT verification, admin role check
│   ├── models/               # Mongoose schemas for User and Order
│   ├── routes/               # /api/auth and /api/orders route definitions
│   ├── seed.js               # Seeds demo user and admin accounts
│   └── index.js              # Express app entry point
│
└── README.md
```

---

## API Reference

### Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Log in and receive JWT | Public |

### Orders

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/orders` | Place a new fuel order | User |
| GET | `/api/orders/my` | Get orders for logged-in user | User |
| GET | `/api/orders/all` | Get all orders across users | Admin |
| PATCH | `/api/orders/:id/status` | Update status of a specific order | Admin |

**Sample order request body**
```json
{
  "fuelType": "Diesel",
  "quantity": 50,
  "deliveryLocation": "123, Sector 45, Gurugram",
  "preferredTime": "2026-06-15T10:00:00Z"
}
```

**Sample order response**
```json
{
  "_id": "664abc123def456",
  "userId": "664abc000aaa111",
  "fuelType": "Diesel",
  "quantity": 50,
  "deliveryLocation": "123, Sector 45, Gurugram",
  "preferredTime": "2026-06-15T10:00:00.000Z",
  "status": "Pending",
  "createdAt": "2026-05-17T08:30:00.000Z"
}
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- A MongoDB Atlas account (free tier works fine) or a local MongoDB instance

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/milanchahar/my-fuel.git
cd myfuels
```

**2. Install dependencies**
```bash
# Frontend
cd client && npm install

# Backend
cd ../server && npm install
```

**3. Configure environment variables**

Create a `.env` file inside the `server/` directory:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Replace `your_mongodb_connection_string` with your Atlas connection string and set a strong value for `JWT_SECRET`.

**4. Seed the database**

This creates a demo admin and a demo user account so you can test both roles immediately:
```bash
cd server
node seed.js
```

**5. Start both servers**

Open two terminals:
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@myfuels.com | admin123 |
| User | user@myfuels.com | user123 |

---

## Key Design Decisions

**JWT over sessions** — The API is stateless. Tokens are issued on login and verified on each protected request without any server-side session storage. This makes the backend easier to scale horizontally.

**Role-based middleware** — Rather than duplicating access checks across controllers, a dedicated `adminCheck` middleware sits in front of any admin-only route. Adding new admin routes in the future only requires attaching this middleware.

**Mongoose schemas with timestamps** — Both models use `{ timestamps: true }`, which automatically manages `createdAt` and `updatedAt` fields. Order status history is implicitly trackable through `updatedAt`.

**Axios instance with interceptors** — The frontend uses a single configured Axios instance that automatically attaches the auth token to every outgoing request, keeping individual API call code clean.

---


_Built by Milan_