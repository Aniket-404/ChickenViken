const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware for checking authentication
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Public routes
router.get('/products', async (req, res) => {
  try {
    const productsRef = admin.firestore().collection('products');
    const snapshot = await productsRef.get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
router.post('/orders', authenticateUser, async (req, res) => {
  try {
    const { items, total, address, paymentMethod } = req.body;
    
    if (!items || !total || !address || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const orderData = {
      userId: req.user.uid,
      items,
      total,
      address,
      paymentMethod,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const orderRef = await admin.firestore().collection('orders').add(orderData);
    
    res.status(201).json({ 
      id: orderRef.id,
      ...orderData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin-only routes
router.get('/admin/orders', authenticateUser, async (req, res) => {
  try {
    // Check if user is admin
    const userSnapshot = await admin.firestore()
      .collection('admins')
      .doc(req.user.uid)
      .get();
    
    if (!userSnapshot.exists) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    const ordersRef = admin.firestore().collection('orders');
    const snapshot = await ordersRef.orderBy('createdAt', 'desc').get();
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
