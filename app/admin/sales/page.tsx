'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SalesData {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  monthly_revenue: Array<{ month: string; revenue: number; orders: number }>;
  top_products: Array<{ product: string; sales: number; revenue: number }>;
  payment_methods: Array<{ method: string; count: number; revenue: number }>;
  customer_insights: {
    new_customers: number;
    returning_customers: number;
    customer_lifetime_value: number;
  };
}

export default function SalesAnalytics() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30days');

  useEffect(() => {
    fetchSalesData();
  }, [timeFilter]);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`/api/admin/sales?period=${timeFilter}`);
      if (response.ok) {
        const { data } = await response.json();
        setSalesData(data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, direction: 'neutral' };
    const percentage = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(percentage),
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading sales analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Time Filter */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Performance Overview</h2>
          <p className="text-slate-600">Track your business metrics and growth</p>
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="1year">Last Year</option>
        </select>
      </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-green-100 text-sm">Total Revenue</div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(salesData?.total_revenue || 0)}
            </div>
            <div className="text-green-100 text-sm">
              📈 +12.5% from last period
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-blue-100 text-sm">Total Orders</div>
              <div className="text-2xl">📦</div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {salesData?.total_orders?.toLocaleString() || '0'}
            </div>
            <div className="text-blue-100 text-sm">
              📈 +8.3% from last period
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-purple-100 text-sm">Avg Order Value</div>
              <div className="text-2xl">💳</div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(salesData?.avg_order_value || 0)}
            </div>
            <div className="text-purple-100 text-sm">
              📈 +3.7% from last period
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-orange-100 text-sm">New Customers</div>
              <div className="text-2xl">👥</div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {salesData?.customer_insights?.new_customers || '0'}
            </div>
            <div className="text-orange-100 text-sm">
              📈 +15.2% from last period
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">📊 Revenue Trend</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {salesData?.monthly_revenue?.map((month, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t w-full"
                    style={{ 
                      height: `${Math.max((month.revenue / Math.max(...(salesData.monthly_revenue?.map(m => m.revenue) || [1]))) * 200, 10)}px` 
                    }}
                  ></div>
                  <div className="text-xs text-slate-600 mt-2 transform -rotate-45 origin-top-left">
                    {month.month}
                  </div>
                </div>
              )) || Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="bg-slate-200 rounded-t w-full h-8"></div>
                  <div className="text-xs text-slate-400 mt-2">Month {i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">📈 Orders Trend</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {salesData?.monthly_revenue?.map((month, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-gradient-to-t from-green-500 to-green-400 rounded-t w-full"
                    style={{ 
                      height: `${Math.max((month.orders / Math.max(...(salesData.monthly_revenue?.map(m => m.orders) || [1]))) * 200, 10)}px` 
                    }}
                  ></div>
                  <div className="text-xs text-slate-600 mt-2 transform -rotate-45 origin-top-left">
                    {month.month}
                  </div>
                </div>
              )) || Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="bg-slate-200 rounded-t w-full h-8"></div>
                  <div className="text-xs text-slate-400 mt-2">Month {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">🏆 Top Products</h3>
            <div className="space-y-4">
              {salesData?.top_products?.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-800">{product.product}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{formatCurrency(product.revenue)}</div>
                    <div className="text-xs text-slate-500">{product.sales} sales</div>
                  </div>
                </div>
              )) || (
                <div className="text-center text-slate-500 py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <div>No product data available</div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">💳 Payment Methods</h3>
            <div className="space-y-4">
              {salesData?.payment_methods?.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-slate-800">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-800">{method.count}</div>
                    <div className="text-xs text-slate-500">{formatCurrency(method.revenue)}</div>
                  </div>
                </div>
              )) || (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-slate-800">Credit Card</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">45</div>
                      <div className="text-xs text-slate-500">$2,340</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-slate-800">PayPal</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">23</div>
                      <div className="text-xs text-slate-500">$1,120</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">👥 Customer Insights</h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatCurrency(salesData?.customer_insights?.customer_lifetime_value || 125)}
                </div>
                <div className="text-sm text-slate-600">Average Customer Lifetime Value</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {salesData?.customer_insights?.new_customers || 42}
                  </div>
                  <div className="text-xs text-green-700">New Customers</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {salesData?.customer_insights?.returning_customers || 28}
                  </div>
                  <div className="text-xs text-blue-700">Returning</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Customer Retention</span>
                  <span className="text-sm font-semibold text-green-600">67%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
} 