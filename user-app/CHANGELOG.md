# ChickenViken User App Changelog

## June 19, 2025
- Fixed Firebase index error in order history:
  - Modified order fetching to avoid requiring a composite Firestore index
  - Implemented client-side sorting for orders by date
  - Added more robust date handling with multiple fallbacks
  - Improved error handling with Firebase-specific error codes
  - Enhanced debugging information for Firebase connection issues
- Fixed order history UI issues in Profile page:
  - Fixed problem where error messages and empty state appeared simultaneously
  - Improved error handling with detailed error messages
  - Added "Try Again" button for error recovery
  - Enhanced empty state UI with better visual elements
  - Added fallback handling for missing or undefined order data
  - Improved orders service with better error logging and debugging
  - Fixed image error handling with fallback images
- Added order history and cancellation feature to Profile page:
  - Users can now view their order history with detailed information
  - Users can cancel pending orders
  - Canceled orders are immediately reflected in the admin-app
  - Added UI to display order status, items, and delivery details
- Added cancelOrder function to orders service
- Fixed address editing functionality in Profile page:
  - Fixed controlled/uncontrolled input warning
  - Fixed issue with Save Changes button not working
  - Added better handling for zipCode/pincode field variations
  - Improved form handling with better validation and error checking
  - Added debug logging for easier troubleshooting
- Completed address editing functionality in Profile page
- Enhanced Profile page UI for address cards with improved styling
- Fixed UI to properly display edit/add modes for addresses
- Improved UX with clearer buttons and visual feedback

## June 19, 2025 (Earlier Today)
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
