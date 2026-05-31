# CreditSea — Loan Management System

A full-stack Loan Management System built with **Next.js** (frontend) and **Express + MongoDB** (backend). Borrowers can apply for loans, and operations/admin users can manage the loan lifecycle from application to disbursement.

## 🛠️ Tech Stack

| Layer    | Technology                              |
|----------|------------------------------------------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS |
| Backend  | Express.js, TypeScript, MongoDB, Mongoose |
| Auth     | JWT (JSON Web Tokens), bcrypt            |
| Deploy   | Vercel (frontend), Render (backend)      |

## 📁 Project Structure

```
Creditsea/
├── backend/          # Express API server
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Helpers
│   │   ├── app.ts        # Entry point
│   │   └── seed.ts       # DB seeder
│   └── package.json
├── frontend/         # Next.js app
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   ├── lib/          # API client
│   │   └── types/        # TypeScript types
│   └── package.json
├── render.yaml       # Render deployment blueprint
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/creditsea-lms.git
cd creditsea-lms
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/credit-sea
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

Seed the database (creates default admin/verifier users):

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file (see `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment

### Backend → Render

1. Create a **Web Service** on [Render](https://render.com)
2. Connect this GitHub repo
3. Set **Root Directory** to `backend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm run start`
6. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`

### Frontend → Vercel

1. Import this repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`

> **Important**: After deploying both, update `CORS_ORIGIN` on Render to your Vercel URL (e.g., `https://creditsea-lms.vercel.app`).

## 🔑 Default Users (after seeding)

| Role     | Email                | Password   |
|----------|----------------------|------------|
| Admin    | admin@creditsea.com  | admin123   |
| Verifier | verifier@creditsea.com | verifier123 |

## 📡 API Endpoints

| Method | Endpoint                          | Description           |
|--------|-----------------------------------|-----------------------|
| POST   | `/api/auth/register`              | Register user         |
| POST   | `/api/auth/login`                 | Login                 |
| GET    | `/api/auth/me`                    | Get current user      |
| PUT    | `/api/borrower/profile`           | Update profile        |
| POST   | `/api/borrower/salary-slip`       | Upload salary slip    |
| POST   | `/api/borrower/apply`             | Apply for loan        |
| GET    | `/api/borrower/loans`             | Get user's loans      |
| GET    | `/api/dashboard/leads`            | Get all leads         |
| GET    | `/api/dashboard/loans`            | Get all loans         |
| PUT    | `/api/dashboard/loans/:id/sanction` | Sanction a loan     |
| PUT    | `/api/dashboard/loans/:id/reject`   | Reject a loan       |
| PUT    | `/api/dashboard/loans/:id/disburse` | Disburse a loan     |
| GET    | `/api/health`                     | Health check          |

## 📄 License

This project is built as part of the CreditSea LMS assignment.
