# CreditSea — Loan Management System

Full-stack LMS with role-based access. Borrowers apply for loans, executives manage the lifecycle (approve → disburse → collect).

**Live Demo:**  
- Frontend: https://creditsea-loanmanagementsystem.vercel.app/

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS  
- **Backend:** Express.js, TypeScript, MongoDB, JWT  
- **Deploy:** Vercel (frontend) + Render (backend)

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
npm run seed            # create default users
npm run dev             # starts on :5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # then fill in your values
npm run dev                  # starts on :3000
```

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@creditsea.com | Admin@123 |
| Sales | sales@creditsea.com | Sales@123 |
| Sanction | sanction@creditsea.com | Sanction@123 |
| Disbursement | disbursement@creditsea.com | Disbursement@123 |
| Collection | collection@creditsea.com | Collection@123 |
| Borrower | borrower@creditsea.com | Borrower@123 |

Run `npm run seed` in the backend to create these users.
