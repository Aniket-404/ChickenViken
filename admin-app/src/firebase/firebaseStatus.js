// Firebase Status Checker
// This can be used to check if Firebase services are available

/**
 * Checks if Firebase services are available and working
 * @returns {Promise<{isAvailable: boolean, message: string}>}
 */
export async function checkFirebaseStatus() {
  try {
    // Try to connect to Firebase Auth endpoint
    const response = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=' + 
      import.meta.env.VITE_ADMIN_FIREBASE_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        continueUri: window.location.origin,
        providerId: 'password'
      }),
    });

    if (response.status === 200) {
      return { isAvailable: true, message: 'Firebase services are available' };
    } else {
      return { 
        isAvailable: false, 
        message: `Firebase services returned status ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      isAvailable: false, 
      message: `Unable to connect to Firebase: ${error.message}` 
    };
  }
}

/**
 * Add a callback to be executed when Firebase becomes available
 * @param {Function} callback - Function to call when Firebase is available
 * @param {number} maxAttempts - Maximum number of retry attempts
 * @param {number} interval - Interval between checks in milliseconds
 * @returns {Function} - Function to cancel the listener
 */
export function onFirebaseAvailable(callback, maxAttempts = 5, interval = 3000) {
  let attempts = 0;
  let timeoutId = null;

  const checkAvailability = async () => {
    attempts++;
    const status = await checkFirebaseStatus();
    
    if (status.isAvailable) {
      callback(status);
      return true;
    } else if (attempts < maxAttempts) {
      timeoutId = setTimeout(checkAvailability, interval);
      return false;
    } else {
      callback({ 
        isAvailable: false, 
        message: `Firebase services unavailable after ${maxAttempts} attempts`
      });
      return false;
    }
  };

  // Start checking
  checkAvailability();

  // Return a function to cancel the listener
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}
