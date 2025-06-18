# ChickenViken User App Changelog

## June 19, 2025
- Removed test functionality from Profile page
- Consolidated documentation into README.md
- Updated Firestore security rules for production
- Fixed "No document to update" error by improving user document handling
- Improved error handling in user profile management

## Earlier Changes

### Firebase Configuration Changes
- Updated `firebase/config.js` to properly initialize two separate Firebase app instances:
  - User app (for auth, user profiles, orders)
  - Admin app (for product data only)
- Exposed proper Firestore instances (`db` for user data, `adminDb` for admin data)

### Created Service Modules
- Created `services/users.js` to handle user data operations with the user Firebase project
- Created `services/orders.js` to handle order operations with the user Firebase project
- Updated `services/products.js` to use the admin Firebase project

### Updated Component Files
- Modified `Profile.jsx` to use the user service instead of direct Firestore calls
- Updated `AuthContext.jsx` to use the user service for user data
- Updated `Checkout.jsx` to use the orders service
- Updated imports and fixed error handling in all affected components

### Security Rules
- Created proper security rules for the user Firebase project
- Improved rules to restrict users to only their own data

### Utility Functions
- Added `utils/keys.js` for generating React keys
