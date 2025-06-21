'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminAuth from '@/app/components/AdminAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      id: 'home',
      title: 'Dashboard',
      icon: '🏠',
      href: '/admin',
      description: 'Overview & Analytics'
    },
    {
      id: 'scanner',
      title: 'Card Scanner',
      icon: '📱',
      href: '/admin/scanner',
      description: 'Scan new cards'
    },
    {
      id: 'inventory',
      title: 'Card Inventory',
      icon: '🃏',
      href: '/admin/inventory',
      description: 'Manage cards'
    },
    {
      id: 'plaques',
      title: 'Plaque Inventory',
      icon: '🖼️',
      href: '/admin/plaques',
      description: 'Manage plaque stock'
    },
    {
      id: 'preview-maker',
      title: 'Preview Maker',
      icon: '🎨',
      href: '/admin/preview-maker',
      description: 'Test plaque previews'
    },
    {
      id: 'leagues',
      title: 'League Management',
      icon: '🏆',
      href: '/admin/leagues',
      description: 'Sports & teams'
    },
    {
      id: 'orders',
      title: 'Order Management',
      icon: '📦',
      href: '/admin/orders',
      description: 'Track orders'
    },
    {
      id: 'users',
      title: 'User Management',
      icon: '👥',
      href: '/admin/users',
      description: 'Manage customers'
    },
    {
      id: 'sales',
      title: 'Sales & Analytics',
      icon: '📊',
      href: '/admin/sales',
      description: 'Revenue insights'
    },
    {
      id: 'ebay',
      title: 'eBay Integration',
      icon: '🛒',
      href: '/admin/ebay',
      description: 'Marketplace search'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      href: '/admin/settings',
      description: 'System config'
    }
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-xl border-r border-slate-200 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <Link href="/" className="text-xl font-black text-slate-800 hover:text-blue-600 transition-colors">
                  Roster Frame
                </Link>
                <div className="text-xs text-slate-500 font-medium">Admin Panel</div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <div className={`transform transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}>
                {sidebarCollapsed ? '→' : '←'}
              </div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  title={sidebarCollapsed ? item.title : ''}
                >
                  <span className={`text-xl ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                    {item.icon}
                  </span>
                  
                  {!sidebarCollapsed && (
                    <div className="ml-3 flex-1">
                      <div className={`font-semibold ${isActive ? 'text-blue-800' : ''}`}>
                        {item.title}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  
                  {!sidebarCollapsed && isActive && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          {!sidebarCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">Admin User</div>
                <div className="text-xs text-slate-500">Administrator</div>
              </div>
              <Link
                href="/"
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                title="View Site"
              >
                🌐
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {menuItems.find(item => isActiveRoute(item.href))?.title || 'Dashboard'}
              </h1>
              <p className="text-slate-600 text-sm">
                {menuItems.find(item => isActiveRoute(item.href))?.description || 'Admin control center'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <Link
                href="/"
                className="bg-slate-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
    </AdminAuth>
  );
} 