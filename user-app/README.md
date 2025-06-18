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

### Deploying Security Rules

To deploy the security rules to your Firebase project:

1. **Using Firebase CLI** (recommended):
   ```
   firebase login
   firebase use chickenviken-30bd9
   firebase deploy --only firestore:rules
   ```

2. **Using Firebase Console**:
   - Go to https://console.firebase.google.com/
   - Select your user project (chickenviken-30bd9)
   - Navigate to Firestore Database → Rules
   - Paste the contents of firestore.rules
   - Click "Publish"

### Security Rules Structure

The security rules are structured as follows:

1. User documents: Only the owner can read/write their own document
2. Orders: Users can only access their own orders
3. Products: Read-only access for everyone
4. All other collections: Denied by default

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

## Troubleshooting

### Common Issues

1. **"Missing or insufficient permissions" Error**
   - This usually means the security rules haven't been deployed to your Firebase project
   - Follow the "Deploying Security Rules" instructions above
   - Verify the user is authenticated before accessing Firestore

2. **"No document to update" Error**
   - This happens when trying to update a user document that doesn't exist yet
   - The app will automatically create user documents as needed
   - If this persists, check that the user ID matches between auth and Firestore

3. **PowerShell Execution Policy Error**
   - If you see "running scripts is disabled on this system" when using Firebase CLI
   - Open PowerShell as Administrator and run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Then try the Firebase commands again

### Validating Firebase Access

1. Try updating your profile information to test Firestore write access
2. Look for these debug log messages in your browser console:
   - "User document created successfully" - Confirms write access is working
   - "User data fetched:" - Confirms read access is working

### Firestore Rules Testing

You can test your Firestore rules using the Firebase Emulator Suite:

```
firebase emulators:start
```

This will start a local Firestore emulator where you can test your rules without affecting production data.
