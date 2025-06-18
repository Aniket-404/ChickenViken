// Firebase Firestore Rules

/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Admins collection
    match /admins/{userId} {
      // Allow read if the document belongs to the authenticated user
      allow read: if request.auth != null && request.auth.uid == userId;
      // Allow write only during creation (signup)
      allow create: if request.auth != null && 
                   request.auth.uid == userId && 
                   !exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      // Allow update if user is authenticated and is updating their own document
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read, write: if isAdmin();
    }
    
    // Products collection
    match /products/{productId} {
      allow read, write: if isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isAdmin();
    }
    
    // Settings collection
    match /settings/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
*/

export const firestoreRules = `
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && 
                   request.auth.uid == userId && 
                   !exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow update: if request.auth != null && request.auth.uid == userId;
    }
    
    match /orders/{orderId} {
      allow read, write: if isAdmin();
    }
    
    match /products/{productId} {
      allow read, write: if isAdmin();
    }
    
    match /users/{userId} {
      allow read, write: if isAdmin();
    }
    
    match /settings/{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
`;
