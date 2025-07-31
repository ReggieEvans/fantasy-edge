# ⚡ Next.js 15 Full-Stack Starter Template

A modern full-stack boilerplate powered by Next.js 15 (App Router), designed for building scalable web apps fast — with built-in authentication, theming, role-based access control, and testing.

![screenshot][product-screenshot-1]

---

## ✨ Features

### ✅ Authentication & Authorization

- Email + password authentication
- JWT token-based sessions (HttpOnly cookies)
- Role-based access (e.g. admin, user)
- Middleware-protected routes

### 🎨 Styling & Theming

- Tailwind CSS with dark/light mode (system default)
- Theme toggle dropdown (light / dark / system)
- Custom Google + local fonts
- Configurable color palette via CSS variables

### 🧠 Developer Experience

- App Router (Next.js 14)
- TypeScript, Zod, React Hook Form
- Path aliases (`@/`) for cleaner imports
- File-based routing with layout support

### 🧪 Testing

- ✅ Jest + React Testing Library for unit tests
- ✅ Cypress for end-to-end testing
- `start-server-and-test` script for seamless E2E flow

### 📦 Full Stack Integration

- MongoDB + Mongoose
- Password hashing with bcrypt
- Secure password reset via token
- Toast notifications using ShadCN

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-username/nextjs-starter.git
cd nextjs-starter

# 2. Install dependencies
npm install

# 3. Add your environment variables
cp .env.example .env.local
# Edit MONGO_URI and JWT_SECRET

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 🧪 Run Tests

```bash
npm run test
```

---

## ✅ E2E Tests (Cypress)

```bash
npm run test:e2e
```

---

## 🛠 Folder Structure

```bash
/app            # Next.js App Router structure
/components     # Reusable UI components (ShadCN)
/cypress        # Cypress E2E Testing
/models         # DB Models (e.g., User)
/lib            # JWT, DB, auth utilities
/hooks          # Custom hooks (e.g., use-toast)
app/api         # API routes for auth/reset
/public         # Static files (e.g. logo, images)
/types          # Typescript Type Definitions
```

---

## 🛡️ Environment Variables

```bash
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret>
RESEND_API_KEY=<resend-api-key>
```

---

## 📄 License

MIT — free for personal and commercial use.

---

## 👋 Author

Built with ❤️ by Reggie Evans

[product-screenshot-1]: public/screenshot-1.png
