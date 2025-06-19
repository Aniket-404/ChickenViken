import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { userDb } from '../../firebase/config';
import { formatCurrency } from '../../utils/currency';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug userDb information
  useEffect(() => {
    console.log('userDb info:', {
      userDbExists: !!userDb,
      userDbType: typeof userDb,
      userDbProjectId: userDb?._databaseId?.projectId || 'Unknown'
    });
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log('Fetching orders from user-app Firestore');
        
        // Use userDb instead of db to fetch from user-app Firestore
        const ordersQuery = query(collection(userDb, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(ordersQuery);
        
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
        }));
        
        console.log(`Found ${ordersData.length} orders in user-app Firestore`);
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} status to ${newStatus} in user-app Firestore`);
      
      // Use userDb instead of db to update in user-app Firestore
      await updateDoc(doc(userDb, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    }
  };

  // Delete order
  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        console.log(`Deleting order ${orderId} from user-app Firestore`);
        
        // Use userDb instead of db to delete from user-app Firestore
        await deleteDoc(doc(userDb, 'orders', orderId));
        
        // Update local state
        setOrders(orders.filter(order => order.id !== orderId));
      } catch (err) {
        console.error('Error deleting order:', err);
        setError('Failed to delete order. Please try again.');
      }
    }
  };

  // View order details
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const OrderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {orders.map(order => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {order.id.slice(0, 8)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {order.createdAt}
              </td>              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {order.address?.name || order.customerName || 'N/A'}
              </td>              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {formatCurrency(order.finalAmount || order.totalAmount || 0)}
              </td><td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="ml-2 block w-24 px-2 py-1 text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <button
                  onClick={() => handleViewDetails(order)}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <OrderTable />
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Order Information</h4>
                  <p className="mt-2 text-sm text-gray-900">
                    <span className="font-medium">Order ID:</span> {selectedOrder.id}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Date:</span> {selectedOrder.createdAt}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Status:</span> {selectedOrder.status || 'pending'}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod || 'N/A'}
                  </p>
                </div>
                <div>                  <h4 className="text-sm font-medium text-gray-500">Customer Information</h4>
                  <p className="mt-2 text-sm text-gray-900">
                    <span className="font-medium">Name:</span> {selectedOrder.address?.name || selectedOrder.customerName || 'N/A'}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Email:</span> {selectedOrder.customerEmail || 'N/A'}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Phone:</span> {selectedOrder.address?.phone || selectedOrder.customerPhone || 'N/A'}
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="font-medium">Address:</span> {selectedOrder.address ? 
                      `${selectedOrder.address.street}, ${selectedOrder.address.city}, ${selectedOrder.address.state} ${selectedOrder.address.zipCode}` : 
                      selectedOrder.shippingAddress || 'N/A'}
                  </p>
                </div>
              </div>

              <h4 className="text-sm font-medium text-gray-500 mb-2">Order Items</h4>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${item.price?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${(item.price * item.quantity)?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                          No items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>              <div className="mt-4 text-right">
                <p className="text-sm text-gray-700">Subtotal: {formatCurrency(selectedOrder.totalAmount || 0)}</p>
                <p className="text-sm text-gray-700">Delivery Fee: {formatCurrency(selectedOrder.deliveryFee || 0)}</p>
                <p className="text-base font-medium text-gray-900 mt-2">
                  Total: {formatCurrency(selectedOrder.finalAmount || selectedOrder.totalAmount || 0)}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
