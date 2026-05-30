# Food Ordering Website

Vue 3 front-end with an Express REST API and MySQL backend. Browse menus, manage a cart, check out, and explore promotions and blog content loaded from the database. Admins manage products, promotions, blogs, and users from `/admin`.

## Features

- **Home** — Hero carousel, service highlights, promotion cards, cuisine categories (data from API).
- **Menu & products** — Browse dishes, product detail pages, cart integration.
- **Shopping cart** — Add items, change quantities, remove lines.
- **Checkout** — Delivery form; saves order to MySQL (customer login required).
- **Order history** — Expandable list of past orders with full line-item details.
- **Auth** — Login and register with **Customer / Admin** account type; JWT session.
- **Account** — View and edit name, phone, address.
- **Admin console** (`/admin`) — CRUD for products, promotions, blog posts, users, and **transactions** (view orders + line items, update status).
- **Promotions & Blog** — Public pages read from MySQL.

## Tech stack

- **Frontend:** Vue 3, Vite, Vue Router, Pinia, Axios
- **Backend:** Node.js, Express, MySQL, JWT, bcrypt

## Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB) running locally

## Setup

1. Copy environment file and set your MySQL password:

```bash
cp .env.example .env
```

Edit `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=foodyhub
```

2. Install dependencies:

```bash
npm install
```

3. Create tables and seed data (products, promotions, blogs, default admin):

```bash
npm run db:seed
```

If you already seeded before orders were added, run:

```bash
npm run db:migrate-orders
```

Default admin account:

- Email: `admin@foodyhub.com`
- Password: `admin123`
- Login with **Account type: Admin**

4. Run API and frontend together:

```bash
npm run dev:all
```

Or in two terminals:

```bash
npm run dev:server
npm run dev
```

- Frontend (customer): http://localhost:5173  
- Admin portal (separate session): http://localhost:5173/admin.html  
- API: http://localhost:3001/api/health

When you run `npm run dev`, both URLs are printed in the terminal. The admin portal uses its own login page and keeps a separate admin session, so you can stay signed in as a customer on the main site while managing the store in admin.

## API overview

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/products` | Public |
| GET | `/api/promotions` | Public (active only) |
| GET | `/api/blogs` | Public (published only) |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET/PUT | `/api/auth/me` | Authenticated |
| CRUD | `/api/admin/products` | Admin |
| CRUD | `/api/admin/promotions` | Admin |
| CRUD | `/api/admin/blogs` | Admin |
| CRUD | `/api/admin/users` | Admin |
| GET/PUT | `/api/admin/orders` | Admin (transactions) |
| POST/GET | `/api/orders` | Customer (place order, history) |

## License

Private / coursework as applicable.
