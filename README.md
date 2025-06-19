# ChickenViken - Raw Chicken Meat Delivery Platform

A full-stack web application for ordering raw chicken meat products, inspired by Licious.in. This monorepo contains both the customer-facing application and the admin dashboard.

## Project Structure

```
/ChickenViken/
├── /admin-app/         # Admin dashboard (React + Vite)
├── /user-app/          # Customer-facing app (React + Vite)
├── /server/            # Express backend (optional)
├── /scripts/          # Setup and utility scripts
├── .gitignore
├── README.md
└── .env.sample        # Sample environment variables
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

## Detailed Setup Instructions

### Prerequisites

1. **Node.js and npm**
   - Install Node.js v16 or later from [nodejs.org](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **Firebase Setup**
   You need two Firebase projects:

   a. **User Firebase Project** (`chickenviken-30bd9`)
   - Used for user authentication
   - User profiles and data
   - Order management
   - Cart persistence

   b. **Admin Firebase Project** (`chickenviken-admin`)
   - Used for admin authentication
   - Product and inventory management
   - Admin dashboard data

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ChickenViken.git
   cd ChickenViken
   ```

2. **Set up environment variables**
   
   Create .env files in both user-app and admin-app directories:

   For user-app/.env:
   ```
   # User Firebase Configuration
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=chickenviken-30bd9
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_FIREBASE_MEASUREMENT_ID=

   # Admin Firebase Configuration (for product data)
   VITE_ADMIN_FIREBASE_API_KEY=
   VITE_ADMIN_FIREBASE_AUTH_DOMAIN=
   VITE_ADMIN_FIREBASE_PROJECT_ID=chickenviken-admin
   VITE_ADMIN_FIREBASE_STORAGE_BUCKET=
   VITE_ADMIN_FIREBASE_MESSAGING_SENDER_ID=
   VITE_ADMIN_FIREBASE_APP_ID=
   VITE_ADMIN_FIREBASE_MEASUREMENT_ID=
   ```

   For admin-app/.env:
   ```
   # Admin Firebase Configuration
   VITE_ADMIN_FIREBASE_API_KEY=
   VITE_ADMIN_FIREBASE_AUTH_DOMAIN=
   VITE_ADMIN_FIREBASE_PROJECT_ID=chickenviken-admin
   VITE_ADMIN_FIREBASE_STORAGE_BUCKET=
   VITE_ADMIN_FIREBASE_MESSAGING_SENDER_ID=
   VITE_ADMIN_FIREBASE_APP_ID=
   VITE_ADMIN_FIREBASE_MEASUREMENT_ID=

   # User Firebase Configuration (for order management)
   VITE_USER_FIREBASE_API_KEY=
   VITE_USER_FIREBASE_AUTH_DOMAIN=
   VITE_USER_FIREBASE_PROJECT_ID=chickenviken-30bd9
   VITE_USER_FIREBASE_STORAGE_BUCKET=
   VITE_USER_FIREBASE_MESSAGING_SENDER_ID=
   VITE_USER_FIREBASE_APP_ID=
   ```

### Application Setup

1. **Install dependencies for all applications**
   ```bash
   # Install root dependencies
   npm install

   # Install user-app dependencies
   cd user-app
   npm install

   # Install admin-app dependencies
   cd ../admin-app
   npm install

   # Install server dependencies (if using)
   cd ../server
   npm install
   ```

2. **Firebase Setup**

   a. Deploy Firestore Security Rules:
   ```bash
   # For user app
   cd user-app
   firebase deploy --only firestore:rules

   # For admin app
   cd ../admin-app
   firebase deploy --only firestore:rules
   ```

   b. Create Initial Super Admin:
   ```bash
   cd ../scripts
   node create-super-admin.js
   ```

3. **Initialize Development Data (Optional)**
   ```bash
   cd scripts
   node init-emulator-data.js
   ```

### Running the Applications

1. **Start User App (Development)**
   ```bash
   cd user-app
   npm run dev
   ```
   Access at: http://localhost:5173

2. **Start Admin App (Development)**
   ```bash
   cd admin-app
   npm run dev
   ```
   Access at: http://localhost:5174

3. **Start Backend Server (Optional)**
   ```bash
   cd server
   npm run dev
   ```
   Access at: http://localhost:5000

### Firebase Emulator Usage

For local development, you can use Firebase emulators:

1. **Start Emulators**
   ```bash
   cd scripts
   .\start-emulators.bat   # On Windows
   # OR
   ./start-emulators.sh    # On Unix-like systems
   ```

2. **Enable Emulators in Apps**
   Set in your .env files:
   ```
   VITE_USE_FIREBASE_EMULATORS=true
   ```

## Security Rules

The project uses two sets of security rules:

1. **User App Rules** (`user-app/firestore.rules`)
   - Users can only read/write their own user document
   - Users can only create/read orders they own
   - Products are read-only for all users

2. **Admin App Rules** (`admin-app/firestore.rules`)
   - Only authenticated admins can access admin data
   - Super admins have full access
   - Regular admins have role-based access

## Development Workflow

1. Run Firebase emulators for local development
2. Use the user app to create and test the user experience
3. Use the admin app to manage products, orders, and users
4. Test changes in the emulator before deploying

## Production Deployment

1. **Build the applications**
   ```bash
   # Build user app
   cd user-app
   npm run build

   # Build admin app
   cd ../admin-app
   npm run build
   ```

2. **Deploy to hosting**
   - Follow your hosting provider's deployment instructions
   - Set up environment variables in your hosting platform
   - Deploy the built applications from the respective `dist` directories

## Troubleshooting

1. **Firebase Connection Issues**
   - Verify your Firebase configuration in .env files
   - Check if Firebase project IDs match
   - Ensure Firebase rules are properly deployed

2. **Build Errors**
   - Clear the node_modules and rebuild:
     ```bash
     rm -rf node_modules
     npm install
     ```
   - Check for environment variables

3. **Runtime Errors**
   - Check browser console for error messages
   - Verify Firebase rules allow the operation
   - Check if you're using the correct Firebase project

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/NewFeature`
3. Commit your changes: `git commit -am 'Add NewFeature'`
4. Push to the branch: `git push origin feature/NewFeature`
5. Submit a pull request
