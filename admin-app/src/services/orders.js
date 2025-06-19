import { collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { userDb } from '../firebase/config';

/**
 * Fetches all orders from the user-app Firestore
 * @returns {Promise<Array>} - Array of orders
 */
export const fetchAllOrders = async () => {
  try {
    console.log('Fetching all orders from user-app Firestore');
    
    // Debug userDb information
    console.log('userDb info:', {
      userDbExists: !!userDb,
      userDbType: typeof userDb,
      userDbProjectId: userDb?._databaseId?.projectId || 'Unknown'
    });
    
    // Check if userDb has a valid projectId
    if (!userDb?._databaseId?.projectId) {
      console.error('Missing project ID in userDb. This will cause 400 errors when fetching orders.');
      console.error('Make sure VITE_USER_FIREBASE_PROJECT_ID is set in your .env file.');
      return [];
    }
    
    const orderQuery = query(
      collection(userDb, 'orders'),
      orderBy('createdAt', 'desc')
    );
    
    console.log('Attempting to fetch orders from collection:', 'orders');
    
    const snapshot = await getDocs(orderQuery);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
    
    console.log(`Found ${orders.length} orders`);
    
    // Debug first order if available
    if (orders.length > 0) {
      console.log('First order:', JSON.stringify(orders[0]));
    } else {
      console.log('No orders found. This could be because:');
      console.log('1. There are no orders in the collection');
      console.log('2. The user-app Firestore configuration is incorrect');
      console.log('3. There are permission issues accessing the user-app Firestore');
    }
    
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Fetches orders by status
 * @param {string} status - The order status
 * @returns {Promise<Array>} - Array of orders
 */
export const fetchOrdersByStatus = async (status) => {
  try {
    console.log(`Fetching orders with status: ${status}`);
    
    const orderQuery = query(
      collection(userDb, 'orders'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(orderQuery);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
    
    console.log(`Found ${orders.length} orders with status: ${status}`);
    return orders;
  } catch (error) {
    console.error(`Error fetching orders with status ${status}:`, error);
    throw error;
  }
};

/**
 * Fetches an order by ID
 * @param {string} orderId - The order ID
 * @returns {Promise<Object|null>} - The order or null if not found
 */
export const fetchOrderById = async (orderId) => {
  try {
    console.log(`Fetching order with ID: ${orderId}`);
    
    const orderDoc = await getDoc(doc(userDb, 'orders', orderId));
    
    if (!orderDoc.exists()) {
      console.log(`No order found with ID: ${orderId}`);
      return null;
    }
    
    const orderData = {
      id: orderDoc.id,
      ...orderDoc.data(),
      createdAt: orderDoc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      updatedAt: orderDoc.data().updatedAt?.toDate()?.toISOString() || new Date().toISOString()
    };
    
    console.log(`Found order: ${orderData.orderId || orderData.id}`);
    return orderData;
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    throw error;
  }
};

/**
 * Updates an order's status
 * @param {string} orderId - The order ID
 * @param {string} status - The new status
 * @returns {Promise<void>}
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} status to: ${status}`);
    
    const orderRef = doc(userDb, 'orders', orderId);
    
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date()
    });
    
    console.log(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};
