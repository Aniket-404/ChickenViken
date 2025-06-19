import { collection, addDoc, getDocs, query, where, serverTimestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
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
      console.error('fetchUserOrders: User ID is required');
      throw new Error('User ID is required');
    }
    
    console.log('Fetching orders from user-app Firestore for user:', userId);
    console.log('Using Firestore instance with project ID:', db?._databaseId?.projectId);
    
    // Use a simpler query that doesn't require a composite index
    // Just filter by userId and we'll sort the results in memory
    const orderQuery = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );
    
    console.log('Executing Firestore query for orders...');
    const snapshot = await getDocs(orderQuery);
    console.log(`Found ${snapshot.docs.length} orders for user:`, userId);
    
    // Map the query results to a more usable format
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Create consistent date objects for sorting
      let createdAtDate;
      try {
        // Try to convert Firestore timestamp to Date
        createdAtDate = data.createdAt?.toDate?.() 
          ? data.createdAt.toDate() 
          : data.createdAt instanceof Date 
            ? data.createdAt 
            : data.orderDate 
              ? new Date(data.orderDate) 
              : new Date();
      } catch (err) {
        console.warn('Error parsing date:', err);
        createdAtDate = new Date(); // Fallback to current date
      }
      
      // Format as ISO string for display
      const createdAt = createdAtDate.toISOString();
      
      return {
        id: doc.id,
        ...data,
        createdAt,
        // Add a JavaScript Date object for sorting
        createdAtDate
      };
    });
    
    // Sort orders by date (newest first) in memory
    // This replaces the Firestore orderBy which requires an index
    orders.sort((a, b) => b.createdAtDate - a.createdAtDate);
      // Remove the temporary sorting field
    const cleanedOrders = orders.map(order => {
      // eslint-disable-next-line no-unused-vars
      const { createdAtDate, ...rest } = order;
      return rest;
    });
    
    // Log a sample order for debugging (if available)
    if (cleanedOrders.length > 0) {
      console.log('Sample order data:', {
        id: cleanedOrders[0].id,
        orderId: cleanedOrders[0].orderId,
        status: cleanedOrders[0].status,
        items: cleanedOrders[0].items?.length || 0
      });
    }
    
    return cleanedOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', error.message, error.code);
    throw error;
  }
};

/**
 * Cancels an order
 * @param {string} orderId - The Firestore document ID of the order
 * @returns {Promise<void>}
 */
export const cancelOrder = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    console.log('Canceling order with ID:', orderId);
    
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: 'canceled',
      updatedAt: serverTimestamp()
    });
    
    console.log('Order canceled successfully');
  } catch (error) {
    console.error('Error canceling order:', error);
    throw error;
  }
};
