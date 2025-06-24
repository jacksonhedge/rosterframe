'use client';

import { useState, useEffect } from 'react';
import AdminAuth from '@/app/components/AdminAuth';

interface EbayCard {
  id: string;
  ebayItemId: string;
  title: string;
  playerName?: string;
  year?: number;
  brand?: string;
  price: number;
  ourPrice?: number;
  shipping: number;
  imageUrl: string;
  listingUrl: string;
  seller: string;
  sellerFeedback?: number;
  condition?: string;
  endTime?: string;
  bids?: number;
  features?: string[];
  // New fields for approval system
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
  affiliateUrl?: string;
}

interface AffiliateConfig {
  campaignId: string;
  customId?: string;
  networkId?: string;
  enabled: boolean;
}

export default function EbayInventoryV2Page() {
  const [cards, setCards] = useState<EbayCard[]>([]);
  const [filteredCards, setFilteredCards] = useState<EbayCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateConfig>({
    campaignId: '',
    customId: '',
    networkId: '9',
    enabled: false
  });
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);

  // Load existing cards and affiliate config
  useEffect(() => {
    loadCards();
    loadAffiliateConfig();
  }, []);

  // Filter cards based on status and search
  useEffect(() => {
    let filtered = cards;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(card => card.status === statusFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(card => 
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.playerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredCards(filtered);
  }, [cards, statusFilter, searchQuery]);

  const loadCards = async () => {
    try {
      const response = await fetch('/api/admin/ebay/inventory');
      const data = await response.json();
      if (data.success) {
        setCards(data.cards);
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAffiliateConfig = async () => {
    try {
      const response = await fetch('/api/admin/ebay/affiliate-config');
      const data = await response.json();
      if (data.success && data.config) {
        setAffiliateConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load affiliate config:', error);
    }
  };

  const saveAffiliateConfig = async () => {
    try {
      const response = await fetch('/api/admin/ebay/affiliate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(affiliateConfig)
      });
      const data = await response.json();
      if (data.success) {
        alert('Affiliate configuration saved successfully!');
        setShowAffiliateModal(false);
      }
    } catch (error) {
      alert('Failed to save affiliate configuration');
    }
  };

  const generateAffiliateUrl = (originalUrl: string): string => {
    if (!affiliateConfig.enabled || !affiliateConfig.campaignId) {
      return originalUrl;
    }

    // Extract item ID from eBay URL
    const itemIdMatch = originalUrl.match(/\/itm\/(\d+)/);
    if (!itemIdMatch) return originalUrl;
    
    const itemId = itemIdMatch[1];
    
    // Build eBay Partner Network URL
    let affiliateUrl = `https://rover.ebay.com/rover/1/711-53200-19255-0/1?`;
    affiliateUrl += `icep_id=114&ipn=icep&toolid=20004`;
    affiliateUrl += `&campid=${affiliateConfig.campaignId}`;
    if (affiliateConfig.customId) {
      affiliateUrl += `&customid=${affiliateConfig.customId}`;
    }
    affiliateUrl += `&icep_item=${itemId}`;
    affiliateUrl += `&ipn=psmain&icep_vectorid=229466&kwid=902099&mtid=824&kw=lg`;

    return affiliateUrl;
  };

  const updateCardStatus = async (cardId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const response = await fetch(`/api/admin/ebay/inventory/${cardId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local state
        setCards(prev => prev.map(card => 
          card.id === cardId 
            ? { 
                ...card, 
                status, 
                notes,
                approvedAt: new Date().toISOString(),
                affiliateUrl: status === 'approved' ? generateAffiliateUrl(card.listingUrl) : undefined
              }
            : card
        ));
      }
    } catch (error) {
      alert('Failed to update card status');
    }
  };

  const bulkUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (selectedCards.size === 0) {
      alert('Please select cards to update');
      return;
    }

    try {
      const response = await fetch('/api/admin/ebay/inventory/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cardIds: Array.from(selectedCards),
          status 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadCards();
        setSelectedCards(new Set());
        alert(`${selectedCards.size} cards ${status}!`);
      }
    } catch (error) {
      alert('Failed to update cards');
    }
  };

  const toggleCardSelection = (cardId: string) => {
    const newSelection = new Set(selectedCards);
    if (newSelection.has(cardId)) {
      newSelection.delete(cardId);
    } else {
      newSelection.add(cardId);
    }
    setSelectedCards(newSelection);
  };

  const selectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(card => card.id)));
    }
  };

  if (isLoading) {
    return (
      <AdminAuth>
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        </div>
      </AdminAuth>
    );
  }

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">eBay Inventory Approval</h1>
              <p className="text-gray-600 mt-2">Review and approve cards before showing to customers</p>
            </div>
            <button
              onClick={() => setShowAffiliateModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <span>💰</span>
              Configure Affiliate
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">{cards.length}</div>
              <div className="text-sm text-gray-600">Total Cards</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">
                {cards.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {cards.filter(c => c.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">
                {cards.filter(c => c.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4 items-center flex-1">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">All Cards</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cards..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
              </div>

              {/* Bulk Actions */}
              {selectedCards.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => bulkUpdateStatus('approved')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve ({selectedCards.size})
                  </button>
                  <button
                    onClick={() => bulkUpdateStatus('rejected')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject ({selectedCards.size})
                  </button>
                </div>
              )}
            </div>

            {filteredCards.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={selectAll}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {selectedCards.size === filteredCards.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {filteredCards.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">No cards found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${
                    selectedCards.has(card.id) ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                    <input
                      type="checkbox"
                      checked={selectedCards.has(card.id)}
                      onChange={() => toggleCardSelection(card.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      card.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      card.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {card.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Card Image */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Card Details */}
                  <div className="p-4">
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{card.title}</h3>
                    
                    {card.playerName && (
                      <p className="text-sm text-blue-600 mb-1">Player: {card.playerName}</p>
                    )}
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-green-600">
                        ${card.price.toFixed(2)}
                      </span>
                      {card.ourPrice && (
                        <span className="text-sm text-gray-500">
                          Our: ${card.ourPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Seller: {card.seller} {card.sellerFeedback && `(${card.sellerFeedback}%)`}</div>
                      {card.condition && <div>Condition: {card.condition}</div>}
                    </div>

                    {/* Action Buttons */}
                    {card.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => updateCardStatus(card.id, 'approved')}
                          className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateCardStatus(card.id, 'rejected')}
                          className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {/* View Links */}
                    <div className="mt-3 flex gap-2 text-xs">
                      <a
                        href={card.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View on eBay
                      </a>
                      {card.status === 'approved' && affiliateConfig.enabled && (
                        <a
                          href={card.affiliateUrl || generateAffiliateUrl(card.listingUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          Affiliate Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Affiliate Configuration Modal */}
        {showAffiliateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">eBay Partner Network Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign ID (Required)
                  </label>
                  <input
                    type="text"
                    value={affiliateConfig.campaignId}
                    onChange={(e) => setAffiliateConfig({...affiliateConfig, campaignId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Your eBay Partner Network Campaign ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={affiliateConfig.customId}
                    onChange={(e) => setAffiliateConfig({...affiliateConfig, customId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Track specific campaigns"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={affiliateConfig.enabled}
                      onChange={(e) => setAffiliateConfig({...affiliateConfig, enabled: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Enable Affiliate Links</span>
                  </label>
                </div>

                <div className="text-sm text-gray-600">
                  <p>💡 When enabled, all approved eBay links will automatically use your affiliate tracking.</p>
                  <p className="mt-2">Sign up at: <a href="https://partnernetwork.ebay.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">partnernetwork.ebay.com</a></p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveAffiliateConfig}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Configuration
                </button>
                <button
                  onClick={() => setShowAffiliateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuth>
  );
}