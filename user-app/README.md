# ChickenViken User App

This is the customer-facing app for ChickenViken, built with React + Vite.

## Firebase Configuration

This application uses two Firebase projects:

1. **User Firebase Project** (`chickenviken-30bd9`)
   - Used for user authentication
   - User profiles and data
   - Order history
   - Cart persistence
   - Security rules are configured to allow users to access only their own data

2. **Admin Firebase Project** (`chickenviken-admin`)
   - Used only for product and category data
   - Read-only access from the user app

## Recent Updates

1. Fixed Firebase configuration to properly separate admin and user projects:
   - Created separate Firestore instances for each project
   - Updated all services to use the correct Firestore instance

2. Created service modules for better organization:
   - `services/products.js` - Uses admin Firebase project
   - `services/users.js` - Uses user Firebase project
   - `services/orders.js` - Uses user Firebase project

3. Fixed Profile page to properly fetch and update user data

4. Updated security rules for the user Firebase project

## Security Rules

The Firebase security rules in `firestore.rules` enforce the following permissions:

- Users can only read/write their own user document
- Users can only create/read orders they own
- Products are read-only

## Environment Variables

The application uses environment variables to configure the Firebase projects. These are defined in `.env`:

```
# Admin Firebase Configuration (for product data)
VITE_ADMIN_FIREBASE_API_KEY=...
VITE_ADMIN_FIREBASE_AUTH_DOMAIN=...
VITE_ADMIN_FIREBASE_PROJECT_ID=...
VITE_ADMIN_FIREBASE_STORAGE_BUCKET=...
VITE_ADMIN_FIREBASE_MESSAGING_SENDER_ID=...
VITE_ADMIN_FIREBASE_APP_ID=...
VITE_ADMIN_FIREBASE_MEASUREMENT_ID=...

# User Firebase Configuration (for user data)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## Important Notes

1. Deploy the security rules to your Firebase project to ensure proper access control
2. The admin project should have its own security rules that prevent unauthorized access

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
