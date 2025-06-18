import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Fetches all products from Firestore
 * @param {string} category - Optional category to filter by
 * @returns {Promise<Array>} Array of products
 */
export const fetchProducts = async (category = null) => {
  try {
    // Get all products and filter in memory to avoid complex indexes
    const snapshot = await getDocs(collection(db, 'products'));
    
    // Process and filter products
    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || null
    }))
    .filter(product => product.inStock)
    .sort((a, b) => a.name.localeCompare(b.name));
    
    // Apply category filter if needed
    if (category && category !== 'all') {
      products = products.filter(product => product.category === category);
    }
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products. Please try again later.');
  }
};

/**
 * Fetches all categories from Firestore
 * @returns {Promise<Array>} Array of categories
 */
export const fetchCategories = async () => {
  try {
    // Get all products
    const snapshot = await getDocs(collection(db, 'products'));
    
    // Extract unique categories from in-stock products
    const categories = new Set();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.inStock && data.category) {
        categories.add(data.category);
      }
    });
    
    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories. Please try again later.');
  }
};
