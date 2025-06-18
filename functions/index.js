const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Firebase function to promote a user to admin role
 * 
 * This function checks if the caller is a super-admin before
 * allowing them to promote another user to admin.
 * 
 * Expected request body:
 * {
 *   targetUserId: string,    // UID of the user to promote
 *   adminRole: string,       // Role to assign (e.g., "admin", "super-admin")
 *   permissions: string[]    // Array of permissions to grant
 * }
 */
exports.promoteToAdmin = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to perform this action.'
    );
  }
  
  // Get the caller's UID
  const callerUid = context.auth.uid;
  
  // Check if the caller is a super-admin
  const callerAdminDoc = await admin.firestore().collection('admins').doc(callerUid).get();
  
  if (!callerAdminDoc.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You are not authorized to promote users to admin.'
    );
  }
  
  const callerData = callerAdminDoc.data();
  const isSuperAdmin = callerData.role === 'super-admin' || 
                       (callerData.permissions && callerData.permissions.includes('manageAdmins'));
  
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super-admins can promote users to admin roles.'
    );
  }
  
  // Validate the request data
  const { targetUserId, adminRole, permissions } = data;
  
  if (!targetUserId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Target user ID is required.'
    );
  }
  
  // Check if the target user exists
  try {
    const userRecord = await admin.auth().getUser(targetUserId);
    
    // User exists, add them to the admins collection
    await admin.firestore().collection('admins').doc(targetUserId).set({
      uid: targetUserId,
      email: userRecord.email,
      role: adminRole || 'admin',
      permissions: permissions || ['read', 'write'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: callerUid
    });
    
    return {
      success: true,
      message: `User ${userRecord.email} has been granted admin privileges.`
    };
    
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to promote user to admin. The user might not exist.',
      error
    );
  }
});

/**
 * Firebase function to revoke admin privileges from a user
 */
exports.revokeAdminPrivileges = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to perform this action.'
    );
  }
  
  // Get the caller's UID
  const callerUid = context.auth.uid;
  
  // Check if the caller is a super-admin
  const callerAdminDoc = await admin.firestore().collection('admins').doc(callerUid).get();
  
  if (!callerAdminDoc.exists) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'You are not authorized to revoke admin privileges.'
    );
  }
  
  const callerData = callerAdminDoc.data();
  const isSuperAdmin = callerData.role === 'super-admin' || 
                       (callerData.permissions && callerData.permissions.includes('manageAdmins'));
  
  if (!isSuperAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super-admins can revoke admin privileges.'
    );
  }
  
  // Validate the request data
  const { targetUserId } = data;
  
  if (!targetUserId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Target user ID is required.'
    );
  }
  
  // Prevent revoking your own admin privileges
  if (targetUserId === callerUid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You cannot revoke your own admin privileges.'
    );
  }
  
  try {
    // Check if the admin document exists
    const adminDoc = await admin.firestore().collection('admins').doc(targetUserId).get();
    
    if (!adminDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'This user does not have admin privileges.'
      );
    }
    
    // Delete the admin document
    await admin.firestore().collection('admins').doc(targetUserId).delete();
    
    return {
      success: true,
      message: 'Admin privileges have been revoked.'
    };
    
  } catch (error) {
    console.error('Error revoking admin privileges:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to revoke admin privileges.',
      error
    );
  }
});
