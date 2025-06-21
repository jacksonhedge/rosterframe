'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Plaque {
  id: string;
  name: string;
  type: '8-spot' | '10-spot';
  description: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
  dimensions: string;
  material: string;
  weight: number;
  active: boolean;
  created_at: string;
}

interface PlaqueInventoryData {
  plaques: Plaque[];
  total_count: number;
  total_value: number;
  low_stock_count: number;
}

export default function PlaqueInventory() {
  const [inventory, setInventory] = useState<PlaqueInventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const plaquesPerPage = 12;

  useEffect(() => {
    fetchInventory();
  }, [currentPage, searchTerm, typeFilter, stockFilter]);

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: plaquesPerPage.toString(),
        search: searchTerm,
        type: typeFilter,
        stock: stockFilter
      });

      const response = await fetch(`/api/admin/plaques?${params}`);
      if (response.ok) {
        const { data } = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Error fetching plaque inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity <= 5) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    if (quantity <= 10) return { label: 'Medium Stock', color: 'bg-blue-100 text-blue-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const totalPages = inventory ? Math.ceil(inventory.total_count / plaquesPerPage) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading plaque inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Add Plaque Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add New Plaque</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Search Plaques
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name or description..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Plaque Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="8-spot">8-Spot Plaques</option>
              <option value="10-spot">10-Spot Plaques</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Stock Level
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Quick Actions
            </label>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStockFilter('all');
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Plaques</p>
              <p className="text-2xl font-bold">{inventory?.total_count || 0}</p>
            </div>
            <div className="text-3xl">🖼️</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Inventory Value</p>
              <p className="text-2xl font-bold">
                ${inventory?.total_value?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">8-Spot Plaques</p>
              <p className="text-2xl font-bold">
                {inventory?.plaques.filter(p => p.type === '8-spot').length || 0}
              </p>
            </div>
            <div className="text-3xl">8️⃣</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">10-Spot Plaques</p>
              <p className="text-2xl font-bold">
                {inventory?.plaques.filter(p => p.type === '10-spot').length || 0}
              </p>
            </div>
            <div className="text-3xl">🔟</div>
          </div>
        </div>
      </div>

      {/* Plaques Grid */}
      {inventory && inventory.plaques.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {inventory.plaques.map((plaque) => {
              const stockStatus = getStockStatus(plaque.stock_quantity);

              return (
                <div
                  key={plaque.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Plaque Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                    {plaque.image_url ? (
                      <Image
                        src={plaque.image_url}
                        alt={plaque.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-slate-500">
                          <div className="text-4xl mb-2">🖼️</div>
                          <div className="text-sm">No Image</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {plaque.type}
                    </div>
                    
                    {/* Stock Status Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold ${stockStatus.color}`}>
                      {stockStatus.label}
                    </div>
                  </div>

                  {/* Plaque Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 mb-1 truncate">
                      {plaque.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2 truncate">
                      {plaque.description}
                    </p>
                    <div className="text-xs text-slate-500 mb-3">
                      <div>{plaque.dimensions} • {plaque.material}</div>
                      <div>{plaque.weight}oz • Stock: {plaque.stock_quantity}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          ${plaque.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">
                          Value: ${(plaque.price * plaque.stock_quantity).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          ✏️
                        </button>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Restock">
                          📦
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No Plaques Found
          </h3>
          <p className="text-slate-500 mb-6">
            {searchTerm 
              ? 'No plaques match your search criteria. Try adjusting your filters.'
              : 'Your plaque inventory is empty. Start by adding some plaques!'
            }
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ➕ Add Your First Plaque
          </button>
        </div>
      )}

      {/* Add Modal placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Plaque</h3>
            <p className="text-slate-600 mb-4">Plaque creation form will go here.</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 