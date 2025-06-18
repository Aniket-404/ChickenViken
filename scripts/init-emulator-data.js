// init-emulator-data.js
// Script to initialize test data in Firebase emulators

const admin = require('firebase-admin');

// Initialize Firebase Admin with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

// Initialize without credentials since we're using emulators
admin.initializeApp({
  projectId: 'chickenviken-30bd9'
});

const auth = admin.auth();
const db = admin.firestore();

async function initializeTestData() {
  console.log('Initializing test data in Firebase emulators...');
  
  try {
    // Create test admin user
    const adminEmail = 'admin@chickenviken.com';
    const adminPassword = 'Admin123!';
    
    let adminUser;
    try {
      adminUser = await auth.getUserByEmail(adminEmail);
      console.log('Admin user already exists:', adminUser.uid);
    } catch (error) {
      adminUser = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: 'Test Admin'
      });
      console.log('Created admin user:', adminUser.uid);
    }
    
    // Set admin custom claims
    await auth.setCustomUserClaims(adminUser.uid, { admin: true });
    
    // Add admin to Firestore
    await db.collection('admins').doc(adminUser.uid).set({
      email: adminEmail,
      displayName: 'Test Admin',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Admin user added to Firestore');
    
    // Create test regular user
    const userEmail = 'user@chickenviken.com';
    const userPassword = 'User123!';
    
    let regularUser;
    try {
      regularUser = await auth.getUserByEmail(userEmail);
      console.log('Regular user already exists:', regularUser.uid);
    } catch (error) {
      regularUser = await auth.createUser({
        email: userEmail,
        password: userPassword,
        displayName: 'Test User'
      });
      console.log('Created regular user:', regularUser.uid);
    }
    
    // Add user to Firestore
    await db.collection('users').doc(regularUser.uid).set({
      email: userEmail,
      displayName: 'Test User',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Regular user added to Firestore');
    
    // Add sample products
    const products = [
      {
        name: 'Chicken Breast',
        price: 12.99,
        description: 'Fresh boneless chicken breast',
        imageUrl: 'https://example.com/chicken-breast.jpg',
        category: 'fresh',
        stock: 50
      },
      {
        name: 'Chicken Thighs',
        price: 9.99,
        description: 'Tender chicken thighs',
        imageUrl: 'https://example.com/chicken-thighs.jpg',
        category: 'fresh',
        stock: 40
      },
      {
        name: 'Chicken Wings',
        price: 8.99,
        description: 'Crispy chicken wings',
        imageUrl: 'https://example.com/chicken-wings.jpg',
        category: 'fresh',
        stock: 60
      }
    ];
    
    for (const product of products) {
      const docRef = db.collection('products').doc();
      await docRef.set({
        ...product,
        id: docRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Added product:', product.name);
    }
    
    console.log('Test data initialization complete!');
    
  } catch (error) {
    console.error('Error initializing test data:', error);
  }
}

initializeTestData()
  .then(() => {
    console.log('Test data initialization completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during test data initialization:', error);
    process.exit(1);
  });
