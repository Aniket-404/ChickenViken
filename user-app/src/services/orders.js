import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Creates a new order in Firestore
 * @param {string} userId - The user's ID
 * @param {Array} items - The cart items
 * @param {number} totalAmount - The total order amount
 * @param {Object} address - The shipping address
 * @param {string} paymentMethod - The payment method
 * @returns {Promise<string>} - The order ID
 */
export const createOrder = async (userId, items, totalAmount, address, paymentMethod = 'COD') => {
  try {
    const orderData = {
      userId,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      totalAmount,
      address,
      status: 'pending',
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
      paymentMethod,
      createdAt: serverTimestamp()
    };
    
    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Fetches all orders for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of orders
 */
export const fetchUserOrders = async (userId) => {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || null
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};
