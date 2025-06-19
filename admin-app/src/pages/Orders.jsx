import { useState, useEffect } from 'react';
import { fetchAllOrders, updateOrderStatus } from '../services/orders';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const allOrders = await fetchAllOrders();
        setOrders(allOrders);
        setError(null);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } 
            : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN');
  };
  if (loading) {
    return <div className="p-4"><div className="skeleton h-6 w-32"></div></div>;
  }

  if (error) {
    return <div className="p-4 text-primary-dark">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="p-4">No orders found.</div>;
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      
      <div className="table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="cell-main">{order.orderId || order.id.substring(0, 8)}</td>
                  <td>
                    <div className="cell-main">{order.address?.name || 'N/A'}</div>
                    <div className="cell-secondary">{order.address?.phone || 'No phone'}</div>
                  </td>
                  <td className="cell-secondary">{formatDate(order.createdAt)}</td>
                  <td>
                    <ul className="space-y-1">
                      {order.items.map((item, index) => (
                        <li key={`${item.id}-${index}`} className="cell-secondary">
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="cell-main">{formatCurrency(order.total)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`status-badge status-badge-${order.status.toLowerCase()}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button className="table-action-btn table-action-btn-primary">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
