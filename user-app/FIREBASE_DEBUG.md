# Firebase Debug Guide

## Instructions for deploying temporary security rules

To fix permission issues, please deploy the temporary security rules:

1. Install Firebase CLI if not already installed:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Run this command to deploy the temporary rules to your user project:
   ```
   firebase use chickenviken-30bd9
   firebase deploy --only firestore:rules
   ```

4. After confirming the app works correctly, secure your database:
   - Run `firebase deploy --only firestore:rules` with the secure rules

## Testing Tips

1. Try updating your profile information to test Firestore write access
2. Look for these debug log messages in your browser console:
   - "User document created successfully" - Confirms write access is working
   - "User data fetched:" - Confirms read access is working

## Common Issues

1. **Wrong Firebase Project**: Ensure you're using chickenviken-30bd9 for user data
2. **Security Rules**: Make sure security rules allow access to the user's document
3. **Firebase Initialization**: Verify the user-app configuration is correct in .env

## Secure Rules (Use these after debugging)

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      // For new documents
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
    
    // Allow read-only access to products
    match /products/{productId} {
      allow read: if true;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
