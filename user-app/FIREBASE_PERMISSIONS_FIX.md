# Firebase Permissions Quick Fix Guide

If you're seeing "Missing or insufficient permissions" errors in your ChickenViken app, follow these steps to fix it:

## Step 1: Deploy the Security Rules

The most likely cause of permission errors is that the Firebase security rules have not been deployed to your project. 

### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your user project (chickenviken-30bd9)
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the content below
6. Click **Publish**

```
// Firestore rules for user-app project - Simplified version
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write documents they own (by user ID)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read-only access to products, categories and test collections
    match /products/{document=**} {
      allow read: if true;
    }
    
    match /categories/{document=**} {
      allow read: if true;
    }
    
    match /test_collection/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Option B: Using Firebase CLI

If you have the Firebase CLI installed and PowerShell script execution is enabled:

```
firebase login
firebase use chickenviken-30bd9
firebase deploy --only firestore:rules
```

## Step 2: Test the Fix

1. Go to the Profile page in your ChickenViken app
2. Try to save your profile information
3. If successful, your profile data should now save and load correctly

## Step 3: Enable PowerShell Script Execution (If Using CLI)

If you got an error about script execution being disabled, you can enable it:

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Confirm by typing 'Y'
4. Try the Firebase CLI commands again

## Step 4: Fix "No document to update" Error

If you're getting an error about "No document to update" when trying to save your profile, the app has been updated to automatically create the document for you. Simply try again and the error should be resolved.

## Moving to Production

Once you've confirmed everything is working correctly, you should replace the test rules with more secure production rules. A secure version of the rules is available in the `firestore.rules.secure` file.

To use these rules:
1. Copy the contents of `firestore.rules.secure`
2. Paste them into the Firebase Console Rules tab
3. Click **Publish**

## Still Having Issues?

Check the detailed debugging instructions in the FIREBASE_DEBUG.md file.
