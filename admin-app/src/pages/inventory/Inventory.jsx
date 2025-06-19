import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [stockAmount, setStockAmount] = useState('');

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const inventoryQuery = query(collection(db, 'products'), orderBy('name'));
        const snapshot = await getDocs(inventoryQuery);
        const inventoryData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInventory(inventoryData);
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory data');
        toast.error('Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Handle stock update
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!currentItem || !stockAmount) return;

    try {
      const newStock = parseInt(stockAmount);
      if (isNaN(newStock) || newStock < 0) {
        throw new Error('Invalid stock amount');
      }

      const productRef = doc(db, 'products', currentItem.id);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.id === currentItem.id
            ? { ...item, stock: newStock, updatedAt: new Date().toISOString() }
            : item
        )
      );

      setIsEditModalOpen(false);
      setCurrentItem(null);
      setStockAmount('');
      toast.success('Stock updated successfully');
    } catch (err) {
      console.error('Error updating stock:', err);
      toast.error('Failed to update stock');
    }
  };

  // Handle stock change input
  const handleStockUpdate = (productId, newStock) => {
    if (newStock < 0) return;
    
    const item = inventory.find(i => i.id === productId);
    if (item) {
      setCurrentItem(item);
      setStockAmount(newStock.toString());
      handleUpdateStock({ preventDefault: () => {} });
    }
  };

  // Handle edit stock modal
  const handleEditStock = (item) => {
    setCurrentItem(item);
    setStockAmount(item.stock?.toString() || '0');
    setIsEditModalOpen(true);
  };

  // Get status text based on stock level
  const getStatusText = (item) => {
    if (!item) return 'N/A';
    if (item.stock > 10) return 'In Stock';
    if (item.stock > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN');
  };

  // Filter products based on search term
  const filteredProducts = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-64 mb-6"></div>
        <div className="skeleton h-96"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-64"
          />
        </div>
      </div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(searchTerm ? filteredProducts : inventory).map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40?text=N/A&bgcolor=F28B82&color=FFFFFF';
                        }}
                      />
                      <div>
                        <div className="cell-main">{item.name}</div>
                        <div className="cell-secondary">ID: {item.id.substring(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-secondary">{item.sku || 'N/A'}</td>
                  <td>
                    <input
                      type="number"
                      value={item.stock || 0}
                      onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value))}
                      className="w-20 text-center"
                      min="0"
                    />
                  </td>
                  <td className="cell-main">{formatCurrency(item.price)}</td>
                  <td className="cell-secondary">{formatDate(item.updatedAt)}</td>
                  <td>
                    <span 
                      className={`status-badge ${
                        item.stock > 10
                          ? 'status-badge-completed'
                          : item.stock > 0
                          ? 'status-badge-pending'
                          : 'status-badge-cancelled'
                      }`}
                    >
                      {getStatusText(item)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEditStock(item)}
                      className="table-action-btn table-action-btn-primary"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {isEditModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Update Stock</h2>
            <form onSubmit={handleUpdateStock}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <div className="text-lg font-medium">{currentItem.name}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Status
                  </label>
                  <div>{getStatusText(currentItem)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Amount
                  </label>
                  <input
                    type="number"
                    value={stockAmount}
                    onChange={(e) => setStockAmount(e.target.value)}
                    className="w-full"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
