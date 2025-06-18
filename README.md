# ChickenViken - Raw Chicken Meat Delivery Platform

A full-stack web application for ordering raw chicken meat products, inspired by Licious.in. This monorepo contains both the customer-facing application and the admin dashboard.

## Project Structure

```
/ChickenViken/
├── /admin-app/         # Admin dashboard (React + Vite)
├── /user-app/          # Customer-facing app (React + Vite)
├── /server/            # Express backend (optional)
├── .gitignore
├── README.md
└── .env.sample         # Sample environment variables
```

## Tech Stack

- **Frontend**: React.js (with Vite)
- **Backend** (optional): Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Render
- **CI/CD**: GitHub + Render Git Integration

## Features

### User Web App
- Authentication: Login/Signup using Firebase Auth
- User Profile Management: Personal info, addresses (CRUD)
- Product Browsing & Ordering
- Cart Management
- Payment Processing
  - Phase 1: Mock payment UI inspired by BharatPe (for testing and design validation)
  - Phase 2 (Final Iteration): Integrate real payment gateway (e.g., Razorpay, Stripe, Paytm)
- Responsive & Animated UI

### Admin Web App
- Secure Authentication for admin users
- Dashboard with Sales Analytics
- Order Management
- Inventory Management
- Real-time Charts & Reporting

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Firebase project

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ChickenViken.git
cd ChickenViken
```

2. Set up environment variables
```bash
cp .env.sample .env
# Edit .env with your Firebase credentials
```

3. Install dependencies and start the user app
```bash
cd user-app
npm install
npm run dev
```

4. Install dependencies and start the admin app
```bash
cd ../admin-app
npm install
npm run dev
```

5. (Optional) Set up and start the backend server
```bash
cd ../server
npm install
npm run dev
```

## Deployment on Render

### Step 1: Push to GitHub
Push your complete monorepo (ChickenViken) to GitHub.

### Step 2: Deploy user-app
1. Go to Render Dashboard
2. Click "New Web Service"
3. Connect to your GitHub repo
4. Set Root Directory: `user-app`
5. Build Command:
   ```
   npm install && npm run build
   ```
6. Start Command:
   ```
   npm run preview
   ```
   or
   ```
   serve -s dist
   ```
7. Add all `VITE_` Firebase environment variables in Render
8. Click Deploy

### Step 3: Deploy admin-app
Repeat the exact steps:
1. Root Directory: `admin-app`
2. Build Command:
   ```
   npm install && npm run build
   ```
3. Start Command:
   ```
   npm run preview
   ```
   or
   ```
   serve -s dist
   ```
4. Add any admin-specific env variables (if different)
5. Click Deploy

### Step 4: (Optional) Deploy Express server
If backend API is needed:
1. Root Directory: `server`
2. Build Command:
   ```
   npm install
   ```
3. Start Command:
   ```
   node index.js
   ```
4. Setup:
   - cors
   - dotenv
   - Firebase Admin SDK for secure access

## UI Design Guidelines

- **Style**: Modern, minimal, clean, animated
- **Fonts**: Inter, Poppins
- **Animations**: framer-motion or CSS transitions
- **Color Palette**: Light neutrals + subtle highlights for user app, Blues for admin app
- **Responsive**: Mobile-first layout
- **Tools**: Tailwind CSS / Styled Components

## Firebase Structure

Use a single Firebase project.

Firestore Collections:
- `/users/{uid}/addresses/`
- `/products/`
- `/orders/`
- `/admins/{adminId}/`
- `/categories/`

## License

[MIT License](LICENSE)
