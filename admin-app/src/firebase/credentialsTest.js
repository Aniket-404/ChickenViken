// Firebase Credentials Test
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Admin Firebase configuration to test
const adminFirebaseConfig = {
  apiKey: "AIzaSyCQdDItZaBZv4Jvc6BFpLBBbjGE-MUOkM8",
  authDomain: "chickenviken-admin.firebaseapp.com",
  projectId: "chickenviken-admin",
  storageBucket: "chickenviken-admin.firebasestorage.app",
  messagingSenderId: "119673044950",
  appId: "1:119673044950:web:f863b494bdd897cc8f2e77",
  measurementId: "G-9LCMCBFF80"
};

// Alternative configuration (using original project for comparison)
const originalFirebaseConfig = {
  apiKey: "AIzaSyBPtdOYy9lRguwon8vsNySVT2PBVAPFi_c",
  authDomain: "chickenviken-30bd9.firebaseapp.com",
  projectId: "chickenviken-30bd9",
  storageBucket: "chickenviken-30bd9.firebasestorage.app",
  messagingSenderId: "235277268712",
  appId: "1:235277268712:web:7c0f02af12bcee6f047b5d"
};

// Test admin Firebase config
async function testAdminConfig() {
  console.log("Testing Admin Firebase Configuration...");
  try {
    // Initialize Firebase with admin config
    const adminApp = initializeApp(adminFirebaseConfig, "admin-test");
    const adminAuth = getAuth(adminApp);
    
    // Make a simple request to verify the API key
    console.log("Testing admin auth endpoint...");
    try {
      // Try to sign in with a non-existent user (will fail, but should give a specific error)
      await signInWithEmailAndPassword(adminAuth, "test@example.com", "password123");
    } catch (error) {
      // We expect an auth/user-not-found error, which means the API key is valid
      // but the user doesn't exist (which is expected)
      console.log("Admin auth error code:", error.code);
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        console.log("✅ Admin API key is valid (got expected auth error)");
        return true;
      } else {
        console.log("❌ Admin API key error:", error.message);
        return false;
      }
    }
  } catch (error) {
    console.error("❌ Failed to initialize admin Firebase:", error);
    return false;
  }
}

// Test original Firebase config
async function testOriginalConfig() {
  console.log("\nTesting Original Firebase Configuration...");
  try {
    // Initialize Firebase with original config
    const originalApp = initializeApp(originalFirebaseConfig, "original-test");
    const originalAuth = getAuth(originalApp);
    
    // Make a simple request to verify the API key
    console.log("Testing original auth endpoint...");
    try {
      // Try to sign in with a non-existent user (will fail, but should give a specific error)
      await signInWithEmailAndPassword(originalAuth, "test@example.com", "password123");
    } catch (error) {
      // We expect an auth/user-not-found error, which means the API key is valid
      console.log("Original auth error code:", error.code);
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        console.log("✅ Original API key is valid (got expected auth error)");
        return true;
      } else {
        console.log("❌ Original API key error:", error.message);
        return false;
      }
    }
  } catch (error) {
    console.error("❌ Failed to initialize original Firebase:", error);
    return false;
  }
}

// Run tests
async function runTests() {
  const adminResult = await testAdminConfig();
  const originalResult = await testOriginalConfig();
  
  console.log("\n--- TEST RESULTS ---");
  console.log("Admin Firebase Config:", adminResult ? "✅ VALID" : "❌ INVALID");
  console.log("Original Firebase Config:", originalResult ? "✅ VALID" : "❌ INVALID");
  
  return {
    adminConfigValid: adminResult,
    originalConfigValid: originalResult
  };
}

// Export the test function
export { runTests };

// Automatically run tests if this file is loaded directly
if (import.meta.url === import.meta.main) {
  runTests();
}
