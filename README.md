# ChickenViken - Raw Chicken Meat Delivery Platform

A full-stack web application for ordering raw chicken meat products, inspired by Licious.in. This monorepo contains both the customer-facing application and the admin dashboard.

## Project Structure

```
/ChickenViken/
├── /admin-app/         # Admin dashboard (React + Vite)
├── /user-app/          # Customer-facing app (React + Vite)
├── /server/            # Express backend (optional)
├── /scripts/           # Setup and utility scripts
├── /functions/         # Firebase Cloud Functions
├── .gitignore
├── README.md
├── DEPLOYMENT_GUIDE.md # Detailed deployment instructions
├── RENDER_WEB_SERVICE_GUIDE.md # Render-specific deployment guide
├── render.yaml         # Render deployment configuration
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
- Cart Management with persistent storage
  - Items stored in localStorage
  - Pending items for non-logged-in users
  - Quantity management and price calculation
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

### Using Render

ChickenViken is configured for deployment on Render.com using the following setup:

1. **User App** (`chickenviken-user-app`)
   - Type: Web Service (Static Site)
   - Build Command: `cd user-app && npm install && npm run build`
   - Publish Directory: `user-app/dist`

2. **Admin App** (`chickenviken-admin-app`)
   - Type: Web Service (Static Site)
   - Build Command: `cd admin-app && npm install && npm run build`
   - Publish Directory: `admin-app/dist`

3. **Backend API** (`chickenviken-api`)
   - Type: Web Service
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm run start`

### Manual Deployment

If you're deploying manually to Render or another platform:

1. **Build the applications**
   ```bash
   # Build user app
   cd user-app
   npm install && npm run build

   # Build admin app
   cd ../admin-app
   npm install && npm run build
   ```

2. **Serve the built applications**
   ```bash
   # Serve user app
   cd user-app
   npx serve -s dist

   # Serve admin app
   cd ../admin-app
   npx serve -s dist
   ```

For detailed deployment instructions, see:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - General deployment guide
- [RENDER_WEB_SERVICE_GUIDE.md](./RENDER_WEB_SERVICE_GUIDE.md) - Render-specific instructions
- [render.yaml](./render.yaml) - Render configuration file

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

## Detailed Project Structure

### User App (`/user-app`)
- `/src/components` - Reusable UI components (Cart, Navbar, ProductCard, etc.)
- `/src/contexts` - React Context providers (Auth, Cart)
- `/src/firebase` - Firebase configuration and utilities
- `/src/hooks` - Custom React hooks
- `/src/pages` - Application pages (Products, Cart, Checkout, etc.)
- `/src/services` - API and service integrations
- `/src/utils` - Utility functions

### Admin App (`/admin-app`)
- `/src/components` - Dashboard components and UI elements
- `/src/contexts` - Admin authentication context
- `/src/firebase` - Admin Firebase configuration
- `/src/hooks` - Custom admin hooks
- `/src/pages` - Admin dashboard pages (Orders, Inventory, etc.)
- `/src/services` - Admin services (Cloudinary, Orders)
- `/src/utils` - Admin utility functions

### Server (`/server`)
- Simple Express backend for handling API requests
- Integration with Firebase Admin SDK

### Scripts (`/scripts`)
- Admin user management scripts
- Firebase emulator configuration
- Seeding scripts for development data

## Cart Implementation

The cart system uses React Context API and localStorage for persistence:

### Cart Provider (`/user-app/src/contexts/CartContext/provider.jsx`)
- Manages cart state with React hooks
- Persists cart items in localStorage
- Handles:
  - Adding items to cart
  - Updating item quantities
  - Removing items
  - Calculating totals
  - Preserving pending items for non-logged-in users

### Cart Features
- **Persistence**: Cart items are saved in localStorage to persist across sessions
- **Guest Cart**: Non-logged-in users can add items, which are stored as pending items
- **Quantity Management**: Increment/decrement item quantities, with automatic removal when quantity reaches zero
- **Price Calculation**: Automatic total calculation based on item prices and quantities
- **Error Handling**: Robust error handling for invalid items or localStorage issues

## Project Updates (June 2025)

Recent updates to the project:

1. **Deployment Configuration**
   - Updated render.yaml for proper deployment of static sites
   - Added serve package to both apps for flexible deployment options
   - Streamlined build and deployment commands

2. **Documentation**
   - Enhanced README with detailed project structure
   - Added comprehensive deployment guides
   - Created deployment checklists for consistent deployments
   - Documented cart implementation

3. **User Experience**
   - Improved cart persistence mechanism
   - Enhanced error handling for cart operations
   - Added pending cart items for non-logged-in users

4. **Project Structure**
   - Organized components for better maintainability
   - Separated contexts for cleaner state management
   - Improved error boundaries throughout the application

## Detailed Setup Instructions
