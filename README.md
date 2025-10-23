# DataBook Admin Panel

Admin panel yang dibangun dengan Next.js 14, Ant Design, Drizzle ORM, dan PostgreSQL.

## 🚀 Features

- ✅ **Authentication System** dengan JWT tokens
- ✅ **Responsive Admin Dashboard** dengan sidebar
- ✅ **User Management** dengan role-based access
- ✅ **Master Data Management** (Users, Products, Categories)
- ✅ **Database Integration** dengan Drizzle ORM + PostgreSQL
- ✅ **Modern UI** dengan Ant Design components
- ✅ **Icons** dari Phosphor Icons
- ✅ **Type Safety** dengan TypeScript

## 📋 Prerequisites

- Node.js 18.x atau lebih baru
- PostgreSQL database
- npm atau yarn

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Buat database PostgreSQL dan update connection string di `.env.local`:

```bash
# Edit file .env.local dan update:
DATABASE_URL="postgresql://username:password@localhost:5432/databook"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 3. Generate dan Jalankan Migrations

```bash
# Generate migration files
npm run db:generate

# Jalankan migrations ke database
npm run db:migrate
```

### 4. Seed Database dengan Sample Data

```bash
npm run db:seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🔐 Login Credentials

Setelah menjalankan seed script, gunakan credentials berikut:

- **Username:** `admin`
- **Password:** `admin123`

## 📁 Project Structure

```
src/
├── app/
│   ├── api/auth/          # API routes untuk authentication
│   ├── admin/             # Admin pages (dashboard, master data)
│   └── login/             # Login page
├── components/
│   └── layouts/           # Layout components (AdminLayout)
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── db/
│   ├── index.ts           # Database connection
│   └── schema.ts          # Drizzle schema definitions
└── lib/
    └── auth.ts            # JWT utilities & password hashing
```

## 🔧 Database Scripts

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed database dengan sample data
npm run db:seed
```

## 🛡️ Security Features

- **JWT Authentication** dengan HTTP-only cookies
- **Password Hashing** dengan bcryptjs (salt rounds: 12)
- **Protected Routes** dengan middleware
- **Role-based Access Control**
- **CSRF Protection** dengan SameSite cookies

## 🔐 Login Credentials (Demo)

- **Username:** `admin`
- **Password:** `admin123`
