'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  user: {
    username: string;
    full_name?: string;
  };
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillment_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items_count: number;
  shipping_address?: string;
}

interface OrdersData {
  orders: Order[];
  total_count: number;
  total_revenue: number;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const ordersPerPage = 20;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter, paymentFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ordersPerPage.toString(),
        search: searchTerm,
        status: statusFilter,
        payment: paymentFilter
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const { data } = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: 'payment' | 'fulfillment') => {
    if (type === 'payment') {
      switch (status) {
        case 'paid':
          return { label: 'Paid', color: 'bg-green-100 text-green-800' };
        case 'pending':
          return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
        case 'failed':
          return { label: 'Failed', color: 'bg-red-100 text-red-800' };
        case 'refunded':
          return { label: 'Refunded', color: 'bg-gray-100 text-gray-800' };
        default:
          return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
      }
    } else {
      switch (status) {
        case 'pending':
          return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
        case 'processing':
          return { label: 'Processing', color: 'bg-blue-100 text-blue-800' };
        case 'shipped':
          return { label: 'Shipped', color: 'bg-purple-100 text-purple-800' };
        case 'delivered':
          return { label: 'Delivered', color: 'bg-green-100 text-green-800' };
        case 'cancelled':
          return { label: 'Cancelled', color: 'bg-red-100 text-red-800' };
        default:
          return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalPages = orders ? Math.ceil(orders.total_count / ordersPerPage) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading orders...</p>
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
                Search Orders
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by order number or user..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fulfillment Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
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
                  setPaymentFilter('all');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{orders?.total_count || 0}</p>
              </div>
              <div className="text-3xl">📦</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${orders?.total_revenue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold">
                  {orders?.orders.filter(order => order.fulfillment_status === 'pending').length || 0}
                </p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Average Order</p>
                <p className="text-2xl font-bold">
                  ${orders?.orders.length ? 
                    (orders.orders.reduce((sum, order) => sum + order.total_amount, 0) / orders.orders.length).toFixed(0) || '0'
                    : '0'
                  }
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {orders && orders.orders.length > 0 ? (
          <>
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Order</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Payment</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Fulfillment</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {orders.orders.map((order) => {
                      const paymentStatus = getStatusBadge(order.payment_status, 'payment');
                      const fulfillmentStatus = getStatusBadge(order.fulfillment_status, 'fulfillment');
                      
                      return (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-semibold text-slate-800">
                                #{order.order_number}
                              </div>
                              <div className="text-sm text-slate-500">
                                {order.items_count} items
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-semibold text-slate-800">
                                {order.user.full_name || order.user.username}
                              </div>
                              <div className="text-sm text-slate-500">
                                @{order.user.username}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-green-600">
                              ${order.total_amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentStatus.color}`}>
                              {paymentStatus.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${fulfillmentStatus.color}`}>
                              {fulfillmentStatus.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-slate-600">
                              {formatDate(order.created_at)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="View Details">
                                👁️
                              </button>
                              <button className="text-green-600 hover:bg-green-50 p-1 rounded" title="Update Status">
                                ✏️
                              </button>
                              <button className="text-purple-600 hover:bg-purple-50 p-1 rounded" title="Print Label">
                                🏷️
                              </button>
                              <button className="text-orange-600 hover:bg-orange-50 p-1 rounded" title="Send Email">
                                ✉️
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
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No Orders Found
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm 
                ? 'No orders match your search criteria. Try adjusting your filters.'
                : 'No orders have been placed yet.'
              }
            </p>
          </div>
        )}
    </div>
  );
} 