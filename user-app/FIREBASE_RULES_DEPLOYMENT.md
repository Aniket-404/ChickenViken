## Firebase Security Rules Deployment Guide

To fix the "Missing or insufficient permissions" error, you need to deploy the provided security rules to your Firebase project:

1. Make sure you have Firebase CLI installed:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project directory (if not already done):
   ```
   firebase init
   ```
   - Select Firestore when prompted
   - Choose your user project (chickenviken-30bd9)
   - When asked about rules file, accept the default (firestore.rules)

4. Deploy the rules:
   ```
   firebase deploy --only firestore:rules
   ```

### Alternative: Update Rules Through Firebase Console

If you prefer using the Firebase Console instead of the CLI:

1. Go to https://console.firebase.google.com/
2. Select your user project (chickenviken-30bd9)
3. Navigate to Firestore Database in the left sidebar
4. Click on the "Rules" tab
5. Replace the existing rules with the contents of the firestore.rules file
6. Click "Publish"

After deploying these rules, your users will be able to:
- Read and write their own user document
- Create and manage their own orders
- Read product data (but not modify it)
