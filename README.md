# Food Ordering Website

Vue 3 front-end for a food ordering and delivery experience: browse menus, manage a cart, check out, and explore promotions and content pages. Built with Vite, Vue Router, and Pinia.

## Features

- **Home** — Hero carousel (images/video), service highlights, promotion cards, cuisine categories, and calls to action.
- **Menu & products** — Browse dishes from mock data, product cards with images, and **product detail** pages per item.
- **Shopping cart** — Add items, change quantities, remove lines; totals and item count in the header (`CartSummary`).
- **Checkout** — Delivery form (name, address, phone), place order, success message, and cart cleared after submit.
- **Auth (demo)** — **Login** and **Register** UI with Pinia `auth` store (demo user session by email).
- **Account & dashboard** — **Account** profile area and **Dashboard** for signed-in experience.
- **Order history** — **History** view for past orders (UI / mock flow).
- **Promotions** — Dedicated promotions listing and links from the home page.
- **Content & marketing** — **About**, **Blog**, and **footer cuisine** landing pages.
- **Layout** — Shared **AppHeader** and **AppFooter** with navigation and routing; scroll-to-top on route change.

## Tech stack

Vue 3, Vite, Vue Router, Pinia, Axios (dependency for future API use).

## Setup

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## License

Private / coursework as applicable.
