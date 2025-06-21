'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  full_name?: string;
  email?: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  status: 'active' | 'suspended' | 'pending';
}

interface UsersData {
  users: User[];
  total_count: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('all');

  const usersPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, sortBy, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        search: searchTerm,
        sort: sortBy,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const { data } = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'bg-green-100 text-green-800' };
      case 'suspended':
        return { label: 'Suspended', color: 'bg-red-100 text-red-800' };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalPages = users ? Math.ceil(users.total_count / usersPerPage) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by username or email..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="username">Username</option>
                <option value="spent">Total Spent</option>
                <option value="orders">Total Orders</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Quick Actions
              </label>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortBy('newest');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{users?.total_count || 0}</p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Users</p>
                <p className="text-2xl font-bold">
                  {users?.users.filter(user => user.status === 'active').length || 0}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">
                  ${users?.users.reduce((sum, user) => sum + user.total_spent, 0).toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Average Order Value</p>
                <p className="text-2xl font-bold">
                  ${users?.users.length ? 
                    (users.users.reduce((sum, user) => sum + user.total_spent, 0) / users.users.reduce((sum, user) => sum + user.total_orders, 0)).toFixed(0) || '0'
                    : '0'
                  }
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {users && users.users.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Orders</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Spent</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Last Order</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Joined</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.users.map((user) => {
                      const status = getStatusBadge(user.status);
                      
                      return (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-semibold text-slate-800">
                                {user.full_name || user.username}
                              </div>
                              <div className="text-sm text-slate-500">
                                @{user.username}
                              </div>
                              {user.email && (
                                <div className="text-sm text-slate-500">
                                  {user.email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-slate-800">
                              {user.total_orders}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-green-600">
                              ${user.total_spent.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-slate-600">
                              {user.last_order_date ? formatDate(user.last_order_date) : 'Never'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-slate-600">
                              {formatDate(user.created_at)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                👁️
                              </button>
                              <button className="text-green-600 hover:bg-green-50 p-1 rounded">
                                ✉️
                              </button>
                              <button 
                                className={`p-1 rounded ${
                                  user.status === 'active' 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                              >
                                {user.status === 'active' ? '🚫' : '✅'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  ← Previous
                </button>
                
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No Users Found
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm 
                ? 'No users match your search criteria. Try adjusting your filters.'
                : 'No users have registered yet.'
              }
            </p>
          </div>
        )}
    </div>
  );
} 