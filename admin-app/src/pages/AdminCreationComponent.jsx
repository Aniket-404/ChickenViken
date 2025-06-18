import React, { useState, useEffect } from 'react';
import { promoteUserToAdmin, listAllAdmins, revokeAdminAccess } from '../firebase/adminUserManager';

function AdminCreationComponent() {
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [role, setRole] = useState('admin');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Load existing admins when component mounts
    loadAdmins();
  }, []);
  
  const loadAdmins = async () => {
    setLoading(true);
    const adminsList = await listAllAdmins();
    setAdmins(adminsList);
    setLoading(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (!email || !uid) {
      setMessage('Email and UID are required');
      setLoading(false);
      return;
    }
    
    const success = await promoteUserToAdmin(uid, email, role);
    
    if (success) {
      setMessage(`User ${email} successfully promoted to ${role}`);
      setEmail('');
      setUid('');
      loadAdmins(); // Refresh the admin list
    } else {
      setMessage('Failed to promote user. Check console for details.');
    }
    
    setLoading(false);
  };
  
  const handleRevoke = async (adminId) => {
    if (window.confirm('Are you sure you want to revoke admin privileges?')) {
      setLoading(true);
      const success = await revokeAdminAccess(adminId);
      
      if (success) {
        setMessage('Admin privileges revoked successfully');
        loadAdmins(); // Refresh the admin list
      } else {
        setMessage('Failed to revoke admin privileges');
      }
      
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Management</h1>
      
      {/* Create Admin Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Admin</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">User ID (UID)</label>
              <input
                type="text"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="User's Firebase UID"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Admin'}
          </button>
          
          {message && (
            <div className={`mt-4 p-3 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
      
      {/* Admin List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Existing Admins</h2>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <p className="text-gray-600 py-4">No admins found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="w-full h-16 border-b border-gray-200 bg-gray-50">
                  <th className="text-left pl-4">Email</th>
                  <th className="text-left">User ID</th>
                  <th className="text-left">Role</th>
                  <th className="text-left">Created At</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} className="h-16 border-b border-gray-200">
                    <td className="pl-4">{admin.email}</td>
                    <td className="truncate max-w-[150px]">{admin.id}</td>
                    <td>{admin.role || 'admin'}</td>
                    <td>{admin.createdAt?.toDate?.().toLocaleString() || 'N/A'}</td>
                    <td>
                      <button
                        onClick={() => handleRevoke(admin.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCreationComponent;
