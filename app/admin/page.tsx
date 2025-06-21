'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NFLDataImporter from '../components/NFLDataImporter';

interface DashboardStats {
  totalCards: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: number;
  lowStockCards: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminSections = [
    {
      id: 'scanner',
      title: 'Card Scanner',
      description: 'Scan cards with your phone camera to add to inventory',
      icon: '📱',
      href: '/admin/scanner',
      stats: stats?.lowStockCards || 0,
      statsLabel: 'Needs Attention',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'inventory',
      title: 'Card Inventory',
      description: 'Manage your card collection and stock levels',
      icon: '🃏',
      href: '/admin/inventory',
      stats: stats?.totalCards || 0,
      statsLabel: 'Total Cards',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'orders',
      title: 'Order Management',
      description: 'Track orders and fulfillment status',
      icon: '📦',
      href: '/admin/orders',
      stats: stats?.totalOrders || 0,
      statsLabel: 'Total Orders',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'View and manage customer accounts',
      icon: '👥',
      href: '/admin/users',
      stats: stats?.totalUsers || 0,
      statsLabel: 'Active Users',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'sales',
      title: 'Sales & Analytics',
      description: 'View sales data and performance metrics',
      icon: '📊',
      href: '/admin/sales',
      stats: stats?.totalRevenue || 0,
      statsLabel: 'Revenue',
      formatStats: (value: number) => `$${value.toLocaleString()}`,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System configuration and preferences',
      icon: '⚙️',
      href: '/admin/settings',
      stats: stats?.recentOrders || 0,
      statsLabel: 'Recent Orders',
      color: 'from-slate-500 to-slate-600'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-slate-600">
          Here's an overview of your Roster Frame business today.
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Cards</p>
                <p className="text-3xl font-bold">{stats.totalCards.toLocaleString()}</p>
              </div>
              <div className="text-4xl">🃏</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Active Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Sections Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-slate-200 overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${section.color}`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{section.icon}</div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">
                      {section.formatStats 
                        ? section.formatStats(section.stats)
                        : section.stats.toLocaleString()
                      }
                    </div>
                    <div className="text-sm text-slate-500">{section.statsLabel}</div>
                  </div>
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                  {section.title}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {section.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Open</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/scanner"
            className="flex items-center space-x-3 bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors"
          >
            <span className="text-2xl">📱</span>
            <span className="font-medium">Scan New Card</span>
          </Link>
          <Link
            href="/admin/inventory?action=add"
            className="flex items-center space-x-3 bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium">Add Manual Entry</span>
          </Link>
          <Link
            href="/admin/orders?status=pending"
            className="flex items-center space-x-3 bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg transition-colors"
          >
            <span className="text-2xl">⏳</span>
            <span className="font-medium">Pending Orders</span>
          </Link>
          <Link
            href="/admin/sales"
            className="flex items-center space-x-3 bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg transition-colors"
          >
            <span className="text-2xl">📈</span>
            <span className="font-medium">View Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 