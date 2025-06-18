// Firebase initialization script to populate the database with sample data
const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json'); // Make sure to have your service account key file

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Sample categories
const categories = [
  { id: 'whole-chicken', name: 'Whole Chicken', description: 'Farm-fresh whole chickens' },
  { id: 'chicken-breast', name: 'Chicken Breast', description: 'Boneless chicken breast cuts' },
  { id: 'chicken-legs', name: 'Chicken Legs', description: 'Juicy chicken legs and drumsticks' },
  { id: 'chicken-wings', name: 'Chicken Wings', description: 'Perfect for frying or grilling' },
  { id: 'marinated', name: 'Marinated Specials', description: 'Pre-marinated chicken ready to cook' }
];

// Sample products
const products = [
  {
    id: 'whole-chicken-1kg',
    name: 'Farm Fresh Whole Chicken (1kg)',
    description: 'Premium quality farm-raised whole chicken, cleaned and ready to cook.',
    price: 180,
    image: 'https://example.com/images/whole-chicken.jpg',
    categoryId: 'whole-chicken',
    stock: 25,
    isPopular: true
  },
  {
    id: 'boneless-breast-500g',
    name: 'Boneless Chicken Breast (500g)',
    description: 'Premium quality boneless, skinless chicken breast.',
    price: 220,
    image: 'https://example.com/images/chicken-breast.jpg',
    categoryId: 'chicken-breast',
    stock: 40,
    isPopular: true
  },
  {
    id: 'chicken-legs-6pcs',
    name: 'Chicken Drumsticks (6 pieces)',
    description: 'Juicy and tender chicken drumsticks, perfect for grilling or frying.',
    price: 190,
    image: 'https://example.com/images/chicken-legs.jpg',
    categoryId: 'chicken-legs',
    stock: 30,
    isPopular: false
  },
  {
    id: 'chicken-wings-10pcs',
    name: 'Chicken Wings (10 pieces)',
    description: 'Fresh chicken wings, ideal for buffalo wings or BBQ.',
    price: 160,
    image: 'https://example.com/images/chicken-wings.jpg',
    categoryId: 'chicken-wings',
    stock: 35,
    isPopular: true
  },
  {
    id: 'tandoori-marinated-500g',
    name: 'Tandoori Marinated Chicken (500g)',
    description: 'Chicken pieces marinated in authentic tandoori spices, ready to cook.',
    price: 250,
    image: 'https://example.com/images/tandoori-chicken.jpg',
    categoryId: 'marinated',
    stock: 20,
    isPopular: true
  }
];

// Create a sample admin user
const createAdmin = async () => {
  const adminData = {
    email: 'admin@chickenviken.com',
    isAdmin: true,
    name: 'Admin User',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection('admins').doc('admin123').set(adminData);
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Add categories to Firestore
const addCategories = async () => {
  try {
    for (const category of categories) {
      await db.collection('categories').doc(category.id).set({
        name: category.name,
        description: category.description,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Categories added successfully');
  } catch (error) {
    console.error('Error adding categories:', error);
  }
};

// Add products to Firestore
const addProducts = async () => {
  try {
    for (const product of products) {
      await db.collection('products').doc(product.id).set({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        categoryId: product.categoryId,
        stock: product.stock,
        isPopular: product.isPopular,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('Products added successfully');
  } catch (error) {
    console.error('Error adding products:', error);
  }
};

// Run the seed script
const seedDatabase = async () => {
  try {
    await createAdmin();
    await addCategories();
    await addProducts();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
