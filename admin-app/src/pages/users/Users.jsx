import { useState, useEffect, useContext, useCallback } from 'react';
import { collection, getDocs, doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/AuthContext';

const Users = () => {
  const { currentUser, loading: authLoading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [hasUsersPermission, setHasUsersPermission] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    permissions: []
  });
  const [loadingAction, setLoadingAction] = useState(false);

  // Function to check if current user has users permission, memoized with useCallback
  const checkUsersPermission = useCallback(async () => {
    if (!currentUser) return false;
    
    try {
      const userDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data();
      // Superadmins have all permissions automatically
      if (userData.role === 'superadmin') return true;
      
      return userData.permissions?.includes('users') || false;
    } catch (err) {
      console.error('Error checking permissions:', err);
      return false;
    }
  }, [currentUser]);

  // Effect to check user permissions
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await checkUsersPermission();
      setHasUsersPermission(hasPermission);
    };
    checkPermission();
  }, [checkUsersPermission]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (authLoading) return;
      
      if (!currentUser) {
        setError('Please log in to view admin users');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check for users permission
        const currentUserDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        
        if (!currentUserDoc.exists()) {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Check if user has 'users' permission
        const currentUserData = currentUserDoc.data();
        const hasUsersPermission = currentUserData.permissions?.includes('users');
        
        if (!hasUsersPermission) {
          setError('Access denied. You do not have permission to view users.');
          setLoading(false);
          return;
        }

        const adminsRef = collection(db, 'admins');
        const snapshot = await getDocs(adminsRef);

        const usersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            displayName: data.displayName || 'N/A',
            email: data.email || 'N/A',
            role: data.role || 'admin',
            isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
            createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toLocaleDateString() : 'N/A',
            lastLogin: data.lastLogin?.toDate?.() ? data.lastLogin.toDate().toLocaleDateString() : 'N/A',
            permissions: data.permissions || []
          };
        });
        
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching admin users:', err);
        const errorMessage = 'Failed to load admin users. Please try again later.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, authLoading]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return searchTerm === '' || 
           (user.displayName && user.displayName.toLowerCase().includes(searchLower)) ||
           (user.email && user.email.toLowerCase().includes(searchLower)) ||
           (user.role && user.role.toLowerCase().includes(searchLower));
  });

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!currentUser) {
      toast.error('You must be logged in to perform this action', {
        toastId: 'auth-error'
      });
      return;
    }

    try {
      setLoadingAction(true);
      // Check if the user has 'users' permission
      const currentUserDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      if (!currentUserDoc.exists()) {
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      const currentUserData = currentUserDoc.data();
      const hasUsersPermission = currentUserData.permissions?.includes('users');
      
      if (!hasUsersPermission) {
        toast.error('Access denied. You do not have permission to manage users.');
        return;
      }

      // Even with users permission, admins can only delete their own account
      if (userId !== currentUser.uid) {
        toast.error('For security reasons, admins can only delete their own account', {
          toastId: 'delete-permission-error'
        });
        return;
      }

      if (!window.confirm('Are you sure you want to delete your admin account? This action cannot be undone.')) {
        return;
      }

      await deleteDoc(doc(db, 'admins', userId));
      setUsers(users.filter(u => u.id !== userId));
      
      if (selectedUser?.id === userId) {
        setIsModalOpen(false);
        setSelectedUser(null);
      }

      toast.success('Admin account deleted successfully');
    } catch (err) {
      console.error('Error deleting admin account:', err);
      toast.error('Failed to delete admin account. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Create admin
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (loadingAction) return;

    try {
      setLoadingAction(true);

      // Check if current user has permission to create admins
      const currentUserDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      if (!currentUserDoc.exists()) {
        throw new Error('Access denied. Admin privileges required.');
      }

      const currentUserData = currentUserDoc.data();
      const hasUsersPermission = currentUserData.permissions?.includes('users');
      
      if (!hasUsersPermission) {
        throw new Error('Access denied. You do not have permission to create admin users.');
      }

      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create the admin document in Firestore      // Get creator's data to check if they are superadmin
      const creatorDoc = await getDoc(doc(db, 'admins', currentUser.uid));
      const creatorData = creatorDoc.data();
      
      const adminData = {
        email: formData.email,
        displayName: formData.displayName,
        // If creator is superadmin, use selected permissions, otherwise clear them
        permissions: creatorData.role === 'superadmin' ? formData.permissions : [],
        isActive: true,
        role: 'admin', // New users can only be regular admins
        createdAt: new Date(),
        lastLogin: null
      };

      await setDoc(doc(db, 'admins', userCredential.user.uid), adminData);

      toast.success('Admin user created successfully');
      setShowAddModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setLoadingAction(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-primary-dark text-lg mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-standard hover:bg-primary-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        {hasUsersPermission && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>Add New Admin</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or role"
          className="w-full p-2 border rounded-md focus:ring-1 focus:ring-primary focus:outline-none"
        />
      </div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Display Name</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="cell-main">{user.email}</td>
                    <td>{user.displayName || '-'}</td>
                    <td>
                      <span className="status-badge status-badge-completed">
                        {user.role || 'Admin'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions?.map((permission) => (
                          <span
                            key={permission}
                            className="status-badge status-badge-pending"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="table-action-btn table-action-btn-danger"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                    No admin users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New Admin</h2>
            <form onSubmit={handleAddAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full"
                    placeholder="admin@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    className="w-full"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {['users', 'products', 'orders', 'inventory'].map((permission) => (
                      <label key={permission} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData({
                              ...formData,
                              permissions: isChecked
                                ? [...formData.permissions, permission]
                                : formData.permissions.filter((p) => p !== permission),
                            });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">User Details</h3>
              <div className="space-y-3">
                <p><strong>Name:</strong> {selectedUser.displayName}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong>Joined:</strong> {selectedUser.createdAt}</p>
                <p><strong>Last Login:</strong> {selectedUser.lastLogin}</p>
                <div>
                  <strong>Permissions:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {selectedUser.permissions.map(permission => (
                      <li key={permission} className="capitalize">{permission}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
