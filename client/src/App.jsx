import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link
} from 'react-router-dom';
import {
  ShoppingBag,
  Users,
  Layers,
  FileText,
  LogOut,
  Search,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Barcode,
  ShoppingCart,
  CheckCircle,
  FileCheck,
  Shield,
  Package,
  Calendar,
  Thermometer,
  ShieldAlert,
  Info
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const UPLOADS_BASE = import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE.replace(/\/api\/?$/, '')
  : '';

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${UPLOADS_BASE}${url}`;
};

// Helper to save & load auth state
const getAuthToken = () => localStorage.getItem('token');
const setAuthToken = (token) => localStorage.setItem('token', token);
const removeAuthToken = () => localStorage.removeItem('token');

// ==========================================
// LOGIN COMPONENT
// ==========================================
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      setAuthToken(data.token);
      onLoginSuccess(data.user);

      // Redirect based on role
      if (data.user.role === 'Admin') navigate('/admin');
      else if (data.user.role === 'Inventory Manager') navigate('/manager');
      else if (data.user.role === 'Cashier') navigate('/cashier');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Login</h2>
          <p className="text-slate-400">Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white outline-none transition"
              placeholder="e.g. admin, cashier"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================
function AdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // User creation form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Cashier');

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'inventory' | 'sales' | 'reports'

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchTransactions();
    fetchAnalytics();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) setUsers(await res.json());
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/products`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) setProducts(await res.json());
  };

  const fetchTransactions = async () => {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) setTransactions(await res.json());
  };

  const fetchAnalytics = async () => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) setAnalytics(await res.json());
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole })
    });
    if (res.ok) {
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to create user');
    }
  };

  const toggleUserActive = async (id, currentStatus) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ isActive: !currentStatus })
    });
    if (res.ok) fetchUsers();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white">Admin Panel</h2>
              <span className="text-xs text-indigo-400 font-semibold uppercase">{user.username}</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'}`}
            >
              <Users className="w-5 h-5" />
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'}`}
            >
              <Layers className="w-5 h-5" />
              All Inventory
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'sales' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'}`}
            >
              <FileText className="w-5 h-5" />
              Sales History
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-100'}`}
            >
              <TrendingUp className="w-5 h-5" />
              Reports & Stats
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">User Management</h1>
                <p className="text-slate-400 mt-1">Manage system user credentials, roles, and status</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* User Creation Form */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Create New Account</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                    <select
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white outline-none"
                    >
                      <option value="Cashier">Cashier</option>
                      <option value="Inventory Manager">Inventory Manager</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
                  >
                    Add User Account
                  </button>
                </form>
              </div>

              {/* Users List */}
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                  <h3 className="text-lg font-bold text-white">System Accounts</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4">Username</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="px-6 py-4 font-medium text-white">{u.username}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                              u.role === 'Inventory Manager' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.username !== 'admin' && (
                              <button
                                onClick={() => toggleUserActive(u.id, u.isActive)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${u.isActive ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'}`}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Full Store Inventory</h1>
              <p className="text-slate-400 mt-1">Real-time view of products across all product categories</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Product Info</th>
                      <th className="px-6 py-4">SKU / Barcode</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-center">Stock</th>
                      <th className="px-6 py-4">Status Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-700 overflow-hidden">
                              {p.imageUrl ? (
                                <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{p.name}</h4>
                              <p className="text-xs text-slate-400 line-clamp-1">{p.description || 'No description'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-300">{p.sku}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-700 text-slate-300">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-white">${parseFloat(p.price).toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-semibold ${p.quantity <= p.reorderThreshold ? 'text-rose-400' : 'text-slate-300'}`}>
                            {p.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.quantity <= p.reorderThreshold ? (
                            <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Adequate
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Global Transaction Log</h1>
              <p className="text-slate-400 mt-1">Audit and review all sales generated by store cashiers</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4">Date / Time</th>
                      <th className="px-6 py-4">Receipt ID</th>
                      <th className="px-6 py-4">Cashier</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                      <th className="px-6 py-4 text-right">Tax (8%)</th>
                      <th className="px-6 py-4 text-right">Total Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-sm">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-6 py-4 text-slate-300">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-white">#TX-{t.id.toString().padStart(5, '0')}</td>
                        <td className="px-6 py-4 text-slate-300">{t.cashierName}</td>
                        <td className="px-6 py-4 text-right text-slate-300">${parseFloat(t.subtotal).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-slate-300">${parseFloat(t.tax).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-400">${parseFloat(t.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && analytics && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Reports & Analytics</h1>
              <p className="text-slate-400 mt-1">Real-time business performance indicators</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Total Sales</p>
                <h3 className="text-3xl font-extrabold text-white">${parseFloat(analytics.todaySales).toFixed(2)}</h3>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All-Time Sales</p>
                <h3 className="text-3xl font-extrabold text-indigo-400">${parseFloat(analytics.totalSalesAllTime).toFixed(2)}</h3>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions Processed</p>
                <h3 className="text-3xl font-extrabold text-emerald-400">{analytics.totalTransactions}</h3>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Products in Low Stock</p>
                <h3 className="text-3xl font-extrabold text-rose-400">{analytics.lowStockCount}</h3>
              </div>
            </div>

            {/* Top Products & Low Stock Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Top Selling Products</h3>
                <div className="divide-y divide-slate-700/50">
                  {analytics.topSelling.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">No sales recorded yet</p>
                  ) : (
                    analytics.topSelling.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">SKU: {item.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-400">{item.quantity} sold</p>
                          <p className="text-xs text-slate-400">${parseFloat(item.sales).toFixed(2)} revenue</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Urgent Reorder Alert
                </h3>
                <div className="overflow-y-auto max-h-60 divide-y divide-slate-700/50">
                  {products.filter(p => p.quantity <= p.reorderThreshold).length === 0 ? (
                    <p className="text-sm text-slate-500 py-4">All products fully stocked</p>
                  ) : (
                    products.filter(p => p.quantity <= p.reorderThreshold).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">Category: {item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-rose-400">{item.quantity} left</p>
                          <p className="text-xs text-slate-400 font-mono">Threshold: {item.reorderThreshold}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==========================================
// INVENTORY MANAGER DASHBOARD
// ==========================================
function ManagerDashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Category-specific stats and lists read-only access
  const [salesHistory, setSalesHistory] = useState([]);

  // Form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reorderThreshold, setReorderThreshold] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Category specific fields
  const [handlingNote, setHandlingNote] = useState('');
  const [isFragile, setIsFragile] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [storageTemp, setStorageTemp] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [isHazardous, setIsHazardous] = useState(false);
  const [safetyNote, setSafetyNote] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchSalesHistory();
  }, [searchQuery, selectedCategoryFilter]);

  const fetchProducts = async () => {
    let url = `${API_BASE}/products?`;
    if (searchQuery) url += `search=${searchQuery}&`;
    if (selectedCategoryFilter) url += `category=${selectedCategoryFilter}`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) {
      setProducts(await res.json());
    }
  };

  const fetchSalesHistory = async () => {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) setSalesHistory(await res.json());
  };

  const handleOpenAdd = () => {
    setEditProduct(null);
    setSku('');
    setName('');
    setCategory('General');
    setPrice('');
    setQuantity('');
    setReorderThreshold('');
    setDescription('');
    setImageFile(null);
    setHandlingNote('');
    setIsFragile(false);
    setExpiryDate('');
    setStorageTemp('');
    setWarrantyPeriod('');
    setSerialNumber('');
    setIsHazardous(false);
    setSafetyNote('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditProduct(p);
    setSku(p.sku);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setQuantity(p.quantity);
    setReorderThreshold(p.reorderThreshold);
    setDescription(p.description || '');
    setImageFile(null);
    setHandlingNote(p.handlingNote || '');
    setIsFragile(p.isFragile || false);
    setExpiryDate(p.expiryDate || '');
    setStorageTemp(p.storageTemp || '');
    setWarrantyPeriod(p.warrantyPeriod || '');
    setSerialNumber(p.serialNumber || '');
    setIsHazardous(p.isHazardous || false);
    setSafetyNote(p.safetyNote || '');
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) fetchProducts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('sku', sku);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('reorderThreshold', reorderThreshold);
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    if (category === 'Fragile') {
      formData.append('handlingNote', handlingNote);
      formData.append('isFragile', isFragile);
    } else if (category === 'Cold') {
      formData.append('expiryDate', expiryDate);
      formData.append('storageTemp', storageTemp);
    } else if (category === 'Tech') {
      formData.append('warrantyPeriod', warrantyPeriod);
      formData.append('serialNumber', serialNumber);
    } else if (category === 'Cleaning') {
      formData.append('isHazardous', isHazardous);
      formData.append('safetyNote', safetyNote);
    }

    const url = editProduct ? `${API_BASE}/products/${editProduct.id}` : `${API_BASE}/products`;
    const method = editProduct ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      body: formData
    });

    if (res.ok) {
      setShowAddModal(false);
      fetchProducts();
    } else {
      const data = await res.json();
      alert(data.message || 'Error occurred while saving product');
    }
  };

  const displayedProducts = showLowStockOnly
    ? products.filter(p => p.quantity <= p.reorderThreshold)
    : products;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-800 border-r border-slate-700/50 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white">Inventory Panel</h2>
              <span className="text-xs text-emerald-400 font-semibold uppercase">{user.username}</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <button
              onClick={handleOpenAdd}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
            <div className="border-t border-slate-700/50 pt-4">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={e => setShowLowStockOnly(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                />
                Show Low Stock Alerts ({products.filter(p => p.quantity <= p.reorderThreshold).length})
              </label>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Inventory Catalog</h1>
              <p className="text-slate-400 mt-1">Configure products, categories, stock, and view alerts</p>
            </div>
          </div>

          {/* Search bar & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700/50 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white transition"
              />
            </div>
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700/50 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white transition"
            >
              <option value="">All Categories</option>
              <option value="Fragile">Fragile</option>
              <option value="Cold">Cold</option>
              <option value="Tech">Tech</option>
              <option value="Cleaning">Cleaning</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map(p => (
              <div key={p.id} className="bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-600 transition">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {p.imageUrl ? (
                        <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-7 h-7 text-slate-500" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs font-semibold rounded">{p.category}</span>
                      {p.quantity <= p.reorderThreshold && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{p.name}</h3>
                    <p className="text-xs font-mono text-slate-500">SKU: {p.sku}</p>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">{p.description || 'No description provided.'}</p>
                  </div>

                  {/* Category Specific Badges */}
                  {p.category === 'Fragile' && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Fragile Handling Required
                      </p>
                      <p className="text-slate-300">{p.handlingNote}</p>
                    </div>
                  )}

                  {p.category === 'Cold' && (
                    <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-xs text-sky-400 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4" /> Cold Storage ({p.storageTemp})
                      </p>
                      <p className="text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Expires: {p.expiryDate}
                      </p>
                    </div>
                  )}

                  {p.category === 'Tech' && (
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-xs text-indigo-400 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <Barcode className="w-4 h-4" /> Tech Info
                      </p>
                      <p className="text-slate-300">Warranty: {p.warrantyPeriod} Months</p>
                      <p className="text-slate-300 font-mono text-[10px]">S/N: {p.serialNumber}</p>
                    </div>
                  )}

                  {p.category === 'Cleaning' && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" /> Hazardous Chemical
                      </p>
                      <p className="text-slate-300">{p.safetyNote}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-700/30">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Price</p>
                      <p className="text-xl font-extrabold text-white">${parseFloat(p.price).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Stock</p>
                      <p className="text-lg font-bold text-slate-300">{p.quantity} units</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/60 px-6 py-4 flex gap-3 border-t border-slate-700/50">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 font-semibold rounded-lg text-sm text-white transition flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-800 border border-slate-700 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col my-8">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Barcode / SKU (Unique)</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Product Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                    >
                      <option value="General">General</option>
                      <option value="Fragile">Fragile</option>
                      <option value="Cold">Cold</option>
                      <option value="Tech">Tech</option>
                      <option value="Cleaning">Cleaning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reorder Threshold</label>
                    <input
                      type="number"
                      value={reorderThreshold}
                      onChange={e => setReorderThreshold(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Image</label>
                    <input
                      type="file"
                      onChange={e => setImageFile(e.target.files[0])}
                      className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none h-20"
                  />
                </div>

                {/* Conditional Fields based on Category Selector */}
                {category === 'Fragile' && (
                  <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-4">
                    <h4 className="text-sm font-bold text-indigo-400">Fragile Fields</h4>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Handling Instructions</label>
                      <input
                        type="text"
                        value={handlingNote}
                        onChange={e => setHandlingNote(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                        placeholder="e.g. bubble wrap"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={isFragile}
                        onChange={e => setIsFragile(e.target.checked)}
                        className="rounded"
                      />
                      Is Fragile Item (Shows Badge Warning)
                    </label>
                  </div>
                )}

                {category === 'Cold' && (
                  <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-4">
                    <h4 className="text-sm font-bold text-indigo-400">Cold Storage Fields</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-2">Expiry Date</label>
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={e => setExpiryDate(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-2">Storage Temperature</label>
                        <input
                          type="text"
                          value={storageTemp}
                          onChange={e => setStorageTemp(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                          placeholder="e.g. -18°C or 4°C"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === 'Tech' && (
                  <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-4">
                    <h4 className="text-sm font-bold text-indigo-400">Tech Fields</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-2">Warranty Period (Months)</label>
                        <input
                          type="number"
                          value={warrantyPeriod}
                          onChange={e => setWarrantyPeriod(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-2">Unique Serial Number</label>
                        <input
                          type="text"
                          value={serialNumber}
                          onChange={e => setSerialNumber(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                          placeholder="e.g. SN-..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {category === 'Cleaning' && (
                  <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-4">
                    <h4 className="text-sm font-bold text-indigo-400">Cleaning Specific</h4>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 tracking-wider mb-2">Safety Note</label>
                      <input
                        type="text"
                        value={safetyNote}
                        onChange={e => setSafetyNote(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none"
                        placeholder="e.g. Avoid eye contact"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={isHazardous}
                        onChange={e => setIsHazardous(e.target.checked)}
                        className="rounded"
                      />
                      Is Hazardous Item (Shows Badge Warning)
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 bg-slate-750 hover:bg-slate-700 font-semibold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ==========================================
// CASHIER POS / BILLING DASHBOARD
// ==========================================
function CashierDashboard({ user, onLogout }) {
  const [skuInput, setSkuInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [taxRate] = useState(0.08); // 8% flat tax rate
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Checkout result modal
  const [printedReceipt, setPrintedReceipt] = useState(null);

  const skuInputRef = useRef(null);

  useEffect(() => {
    fetchRecentTransactions();
    if (skuInputRef.current) {
      skuInputRef.current.focus();
    }
  }, []);

  const fetchRecentTransactions = async () => {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) {
      setRecentTransactions(await res.json());
    }
  };

  // Simulate scanning lookup on Enter
  const handleSkuScanSubmit = async (e) => {
    e.preventDefault();
    if (!skuInput.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/products/sku/${skuInput.trim()}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const product = await res.json();
      if (!res.ok) {
        throw new Error(product.message || 'Product SKU not found');
      }
      addToCart(product);
      setSkuInput('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Manual fallback search
  const handleManualSearch = async (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    const res = await fetch(`${API_BASE}/products?search=${val}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (res.ok) {
      setSearchResults(await res.json());
    }
  };

  const addToCart = (product) => {
    // Check stock limit
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > product.quantity) {
        alert(`Insufficient stock! Only ${product.quantity} items left in stock.`);
        return;
      }
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      if (product.quantity < 1) {
        alert('Insufficient stock! Out of stock.');
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, newQty, availableStock) => {
    if (newQty < 1) return;
    if (newQty > availableStock) {
      alert(`Insufficient stock! Only ${availableStock} items left in stock.`);
      return;
    }
    const newCart = cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: parseInt(newQty) };
      }
      return item;
    });
    setCart(newCart);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * taxRate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const payload = {
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const res = await fetch(`${API_BASE}/transactions/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      setPrintedReceipt(data);
      setCart([]);
      fetchRecentTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row">
      {/* Left Area - Barcode lookup, Search panel and Transactions */}
      <div className="flex-1 p-6 md:p-8 space-y-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Checkout Terminal</h1>
                <p className="text-xs text-slate-400">Cashier: <span className="text-indigo-400 font-bold">{user.username}</span></p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 font-semibold rounded-xl text-sm transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Barcode scanner simulator input */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Barcode className="w-5 h-5 text-indigo-400" />
              Barcode Scanner Simulator
            </h3>
            <form onSubmit={handleSkuScanSubmit} className="flex gap-2">
              <input
                ref={skuInputRef}
                type="text"
                value={skuInput}
                onChange={e => setSkuInput(e.target.value)}
                placeholder="Scan / Type SKU (e.g. COLD-002, TECH-003) & press Enter..."
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-white font-mono transition"
              />
              <button
                type="submit"
                className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
              >
                Scan Item
              </button>
            </form>
          </div>

          {/* Manual search panel */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-400" />
              Manual Product Catalog Lookup
            </h3>
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleManualSearch(e.target.value)}
              placeholder="Type product name or category to search..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-white transition"
            />

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {searchResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => { addToCart(p); setSearchResults([]); setSearchQuery(''); }}
                    className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl cursor-pointer hover:border-slate-500 transition flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-750 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={resolveImageUrl(p.imageUrl)} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{p.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">SKU: {p.sku} | Price: ${p.price}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${p.quantity < 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {p.quantity < 1 ? 'Out' : `${p.quantity} left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction History (My Sales) */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4">My Checkout Log</h3>
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Receipt ID</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3 text-right">Items</th>
                  <th className="px-4 py-3 text-right">Total Paid</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentTransactions.slice(0, 5).map(t => (
                  <tr key={t.id} className="hover:bg-slate-850 transition">
                    <td className="px-4 py-3 font-mono font-bold text-white">#TX-{t.id.toString().padStart(5, '0')}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(t.createdAt).toLocaleTimeString()}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{(t.items || []).length} lines</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">${parseFloat(t.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setPrintedReceipt(t)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Area - Cart Panel */}
      <div className="w-full lg:w-[420px] bg-slate-850 border-l border-slate-700/50 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-400" />
              Selected Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Cart list */}
          <div className="space-y-3 overflow-y-auto max-h-[50vh]">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm">Scan barcode or search items to populate cart</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="p-3 bg-slate-900 border border-slate-750 rounded-xl space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku} | Price: ${item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-750">
                    <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.quantity)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-semibold text-xs text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.quantity)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pricing Subtotal and Action Checkout button */}
        <div className="mt-6 pt-6 border-t border-slate-750 space-y-4">
          <div className="space-y-2.5 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-white">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax (8%)</span>
              <span className="font-semibold text-white">${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-700/30">
              <span>Total Price</span>
              <span className="text-emerald-400">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Checkout (F8)
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 max-w-sm w-full rounded-xl overflow-hidden shadow-2xl p-6 space-y-4 font-mono text-sm relative">
            <button
              onClick={() => setPrintedReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-sans font-bold text-lg"
            >
              ✕
            </button>
            <div className="text-center border-b border-dashed border-slate-300 pb-4">
              <h2 className="text-lg font-bold">SUPERMARKET MART</h2>
              <p className="text-xs text-slate-500">123 Supermarket Ave, NY</p>
              <p className="text-xs text-slate-500">Terminal: #TX-{printedReceipt.id.toString().padStart(5, '0')}</p>
              <p className="text-xs text-slate-500">{new Date(printedReceipt.createdAt).toLocaleString()}</p>
            </div>

            <div className="space-y-2 py-2 border-b border-dashed border-slate-300">
              {printedReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div>
                    <p className="font-bold">{item.productName}</p>
                    <p className="text-slate-500">{item.quantity} x ${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <p className="font-bold align-bottom">${parseFloat(item.subtotal).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${parseFloat(printedReceipt.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>${parseFloat(printedReceipt.tax).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-dashed border-slate-300 pt-1">
                <span>Total Paid:</span>
                <span>${parseFloat(printedReceipt.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 pt-4 border-t border-dashed border-slate-300 space-y-1">
              <p className="font-bold">Thank You For Shopping!</p>
              <p>Cashier: {printedReceipt.cashierName}</p>
              <button
                onClick={() => window.print()}
                className="mt-3 px-4 py-1.5 bg-slate-900 text-white font-semibold rounded font-sans text-xs inline-flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// APP COMPONENT (ROUTING / ROLE RESOLVER)
// ==========================================
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = getAuthToken();
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            removeAuthToken();
          }
          setLoading(false);
        })
        .catch(() => {
          removeAuthToken();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mono">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'Admin' ? '/admin' : user.role === 'Inventory Manager' ? '/manager' : '/cashier'} replace /> : <Login onLoginSuccess={setUser} />}
        />

        <Route
          path="/admin"
          element={user && user.role === 'Admin' ? <AdminDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/manager"
          element={user && user.role === 'Inventory Manager' ? <ManagerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/cashier"
          element={user && user.role === 'Cashier' ? <CashierDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
