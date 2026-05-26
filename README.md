<div align="center">

# Smart Spend

**Personal finance tracker built with the MERN stack**

</div>

---

## Overview

Smart Spend is a full-stack web application for tracking personal income and expenses. Users get a protected dashboard with charts, budget limits per category, transaction filters, and Excel exports — all with full dark mode support.

![Dashboard preview](./frontend/public/dashbord_preview.png)

---

## Features

**Transactions**

- Add, view, and delete income and expense records with emoji icons
- Debounced search and multi-field filters — by date range, amount, and category/source
- Paginated lists (20 per page) with server-side sorting
- Export filtered results to Excel (.xlsx)

**Budgets**

- Set monthly spending limits per category
- Live progress bars that turn amber at 80% and red at 100%
- Month navigator to review past and future budgets
- Summary strip: total limit, total spent, number of over-budget categories

**Dashboard**

- Balance, total income, and total expense summary cards
- Last 30 days expenses bar chart
- Last 60 days income area chart
- Finance overview pie chart
- Recent transactions feed

**UI & UX**

- Dark mode with system preference detection, persisted to localStorage
- Responsive layout
- Skeleton loaders on all async views
- Protected routes — unauthenticated users are redirected to login

**Security**

- JWT authentication (1-hour expiry)
- Passwords hashed with bcrypt
- Ownership check on every delete — users can only delete their own records
- CORS restricted to allowed origins via `CLIENT_URL` env variable
- Amount validated as positive number on both client and server

---

## Tech Stack

**Frontend**

|                    |                                                  |
| ------------------ | ------------------------------------------------ |
| React 19 + Vite    | UI framework and build tool                      |
| Tailwind CSS 3     | Utility-first styling with `darkMode: "class"`   |
| Recharts           | Bar, area, and pie charts                        |
| Axios              | HTTP client with request/response interceptors   |
| React Router 7     | Client-side routing with protected routes        |
| date-fns           | Lightweight date formatting (replaces moment.js) |
| react-hot-toast    | Toast notifications                              |
| emoji-picker-react | Emoji icon selector for transactions             |

**Backend**

|                      |                                 |
| -------------------- | ------------------------------- |
| Node.js + Express 5  | REST API server                 |
| MongoDB + Mongoose 8 | Database and ODM                |
| bcryptjs             | Password hashing                |
| jsonwebtoken         | JWT generation and verification |
| multer               | Profile image uploads           |
| xlsx                 | Excel file generation           |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### Backend

```bash
cd backend
cp env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, CLIENT_URL
npm install
npm run dev          # starts on port 5000 with nodemon
```

### Frontend

```bash
cd frontend/smart_spend
cp env.example .env
# Edit .env — set VITE_API_URL=http://localhost:5000
npm install
npm run dev          # starts on port 5173
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable     | Description                             | Example                                 |
| ------------ | --------------------------------------- | --------------------------------------- |
| `MONGO_URI`  | MongoDB connection string               | `mongodb://localhost:27017/smart_spend` |
| `JWT_SECRET` | Secret key for signing JWT tokens       | any long random string                  |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173`                 |
| `PORT`       | Port the API listens on                 | `5000`                                  |

### Frontend — `frontend/smart_spend/.env`

| Variable       | Description                 | Example                 |
| -------------- | --------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000` |

---

## API Reference

All endpoints except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.
