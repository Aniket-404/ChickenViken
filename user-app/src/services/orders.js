import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, getDoc, doc } from 'firebase/firestore';
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
export const createOrder = async (userId, items, totalAmount, address, paymentMethod = 'UPI') => {
  try {
    // Validate required fields
    if (!userId || !items || !totalAmount || !address) {
      throw new Error('Missing required fields for order creation');
    }

    console.log('Creating order with address:', JSON.stringify(address));

    // Try to get the user document to get the email
    let userEmail = '';
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        userEmail = userDoc.data().email || '';
      }
    } catch (err) {
      console.warn('Could not fetch user email:', err);
    }

    // Add order metadata
    const orderMetadata = {
      orderId: `ORD${Date.now()}`,
      orderDate: new Date().toISOString(),
      userDisplayId: userId.substring(0, 8) // First 8 chars of userId for easy reference
    };

    console.log('Order metadata:', orderMetadata);
    
    // Format the order data
    const orderData = {
      userId,
      orderId: orderMetadata.orderId,
      orderDate: orderMetadata.orderDate,
      userDisplayId: orderMetadata.userDisplayId,
      customerEmail: userEmail, // Add email to the order for admin-app
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price), // Ensure price is a number
        quantity: Number(item.quantity), // Ensure quantity is a number
        imageUrl: item.imageUrl || '' // Use imageUrl and provide fallback
      })),
      totalAmount: Number(totalAmount), // Ensure totalAmount is a number
      deliveryFee: 40, // Add delivery fee
      finalAmount: Number(totalAmount) + 40, // Add total with delivery fee
      address: {
        // Only include non-undefined fields and ensure they're all strings
        name: String(address.name || ''),
        phone: String(address.phone || ''),
        street: String(address.street || ''),
        city: String(address.city || ''),
        state: String(address.state || ''),
        zipCode: String(address.zipCode || address.pincode || '') // Support legacy 'pincode' field
      },
      status: 'pending',
      paymentStatus: 'paid', // Since we're using UPI
      paymentMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
      console.log('Creating order in user-app Firestore...');
    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    console.log('Order created successfully with ID:', orderRef.id);
    console.log('User-friendly Order ID:', orderMetadata.orderId);
    
    // Return both the Firestore ID and the readable order ID
    return {
      id: orderRef.id,
      orderId: orderMetadata.orderId
    };
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
    if (!userId) {
      throw new Error('User ID is required');
    }    console.log('Fetching orders from user-app Firestore for user:', userId);
    
    const orderQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(orderQuery);
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
