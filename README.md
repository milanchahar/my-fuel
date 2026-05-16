# MyFuels - Fuel Order Management System

A full-stack web application for managing fuel orders. Users can place fuel delivery orders and track them in real-time, while admins can manage all orders from a dedicated panel.

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, React Hot Toast, Tailwind CSS
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
**Database:** MongoDB Atlas

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### Setup

1. Clone the repo

```bash
git clone https://github.com/milanchahar/my-fuel.git
cd myfuels
```

2. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

3. Configure environment variables

Create `server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

4. Seed the database

```bash
cd server
node seed.js
```

5. Start the servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Frontend runs on `http://localhost:5173`
Backend runs on `http://localhost:5000`

## Demo Credentials

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@myfuels.com  | admin123 |
| User  | user@myfuels.com   | user123  |

## API Endpoints

| Method | Endpoint                  | Description              | Auth     |
|--------|---------------------------|--------------------------|----------|
| POST   | /api/auth/register        | Register new user        | Public   |
| POST   | /api/auth/login           | Login user               | Public   |
| POST   | /api/orders               | Place a new order        | User     |
| GET    | /api/orders/my            | Get logged-in user's orders | User  |
| GET    | /api/orders/all           | Get all orders           | Admin    |
| PATCH  | /api/orders/:id/status    | Update order status      | Admin    |

## Architecture

```
Client (React + Vite)
    |
    | Axios (Bearer Token)
    |
Express API (Node.js)
    |
    | Mongoose ODM
    |
MongoDB Atlas
```

## Project Structure

```
myfuels/
├── client/
│   └── src/
│       ├── api/           # Axios instance
│       ├── components/    # Navbar, ProtectedRoute
│       ├── context/       # AuthContext
│       └── pages/         # All page components
├── server/
│   ├── controllers/       # Auth, Order logic
│   ├── middleware/         # JWT auth, admin check
│   ├── models/            # User, Order schemas
│   ├── routes/            # Auth, Order routes
│   ├── seed.js            # Database seeder
│   └── index.js           # Express entry point
└── README.md
```
