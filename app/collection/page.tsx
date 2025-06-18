'use client';

import { useState, useEffect } from 'react';

interface CollectionStats {
  total_target_players: number;
  players_owned: number;
  players_wanted: number;
  completion_percentage: number;
  total_cards_owned: number;
  total_cards_wanted: number;
}

export default function CollectionPage() {
  const [targetPlayers, setTargetPlayers] = useState([]);
  const [rosterAnalysis, setRosterAnalysis] = useState([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const [filters, setFilters] = useState({
    collection_status: '',
    priority_level: '',
    position: '',
    min_roster_percentage: ''
  });

  useEffect(() => {
    if (activeTab === 'collection') {
      fetchCollection();
    }
  }, [activeTab, filters]);

  const fetchCollection = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      const response = await fetch(`/api/collection?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setTargetPlayers(result.data.target_players);
        setStats(result.data.stats);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRoster = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/collection/analyze');
      const result = await response.json();
      
      if (result.success) {
        setRosterAnalysis(result.data.roster_analysis);
      }
    } catch (error) {
      console.error('Error analyzing roster:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTargetPlayersFromAnalysis = async (minRosterPercentage = 20) => {
    setLoading(true);
    try {
      const response = await fetch('/api/collection/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          min_roster_percentage: minRosterPercentage,
          create_targets: true
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`Created ${result.data.target_players_created} target players!`);
        setActiveTab('collection');
      }
    } catch (error) {
      console.error('Error creating target players:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerStatus = async (playerId: string, status: string, priority?: number) => {
    try {
      const response = await fetch('/api/collection', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: playerId,
          collection_status: status,
          priority_level: priority
        })
      });
      
      if (response.ok) {
        fetchCollection(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'owned': return 'bg-green-100 text-green-800';
      case 'wanted': return 'bg-red-100 text-red-800';
      case 'multiple': return 'bg-purple-100 text-purple-800';
      case 'not_interested': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Card Collection Tracker</h1>
              <p className="text-gray-600 mt-2">Manage your fantasy football card collection targets</p>
            </div>
            
            {stats && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Collection Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.completion_percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  {stats.players_owned} of {stats.total_target_players} players
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'analysis'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Roster Analysis
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'collection'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Collection
          </button>
        </div>

        {/* Roster Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Roster Analysis - 2024 Season End Targets
                </h2>
                <button
                  onClick={analyzeRoster}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Analyze Current Rosters'}
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                This analysis shows players rostered across your Sleeper leagues. 
                Higher roster percentages indicate players you're most likely to want cards for.
              </p>

              {rosterAnalysis.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Top Rostered Players ({rosterAnalysis.length} total)
                    </h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => createTargetPlayersFromAnalysis(50)}
                        className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
                      >
                        Create Targets (50%+ rostered)
                      </button>
                      <button
                        onClick={() => createTargetPlayersFromAnalysis(20)}
                        className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                      >
                        Create Targets (20%+ rostered)
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {rosterAnalysis.slice(0, 20).map((player: any) => (
                      <div
                        key={player.sleeper_player_id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="font-semibold text-gray-900">{player.name}</div>
                            <span className="text-sm text-gray-600">
                              {player.position} - {player.team}
                            </span>
                            {player.is_rookie && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                Rookie
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {player.roster_percentage}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {player.total_leagues} leagues
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`text-sm px-2 py-1 rounded ${
                              player.estimated_value_tier === 'elite' ? 'bg-red-100 text-red-800' :
                              player.estimated_value_tier === 'high' ? 'bg-orange-100 text-orange-800' :
                              player.estimated_value_tier === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              player.estimated_value_tier === 'low' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {player.estimated_value_tier}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters.collection_status}
                  onChange={(e) => setFilters({...filters, collection_status: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Statuses</option>
                  <option value="wanted">Wanted</option>
                  <option value="owned">Owned</option>
                  <option value="multiple">Multiple Owned</option>
                  <option value="not_interested">Not Interested</option>
                </select>

                <select
                  value={filters.priority_level}
                  onChange={(e) => setFilters({...filters, priority_level: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Priorities</option>
                  <option value="1">Must Have (1)</option>
                  <option value="2">High Priority (2)</option>
                  <option value="3">Medium Priority (3)</option>
                  <option value="4">Low Priority (4)</option>
                  <option value="5">Future Target (5)</option>
                </select>

                <select
                  value={filters.position}
                  onChange={(e) => setFilters({...filters, position: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Positions</option>
                  <option value="QB">QB</option>
                  <option value="RB">RB</option>
                  <option value="WR">WR</option>
                  <option value="TE">TE</option>
                  <option value="K">K</option>
                  <option value="DEF">DEF</option>
                </select>

                <input
                  type="number"
                  placeholder="Min Roster %"
                  value={filters.min_roster_percentage}
                  onChange={(e) => setFilters({...filters, min_roster_percentage: e.target.value})}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            {/* Target Players List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Target Players</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : targetPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">No target players found.</div>
                  <div className="text-sm text-gray-400 mt-2">
                    Try analyzing your roster first to create target players.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {targetPlayers.map((player: any) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="font-semibold text-gray-900">{player.name}</div>
                          <span className="text-sm text-gray-600">
                            {player.position} - {player.team}
                          </span>
                          {player.is_rookie && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Rookie
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="text-sm text-gray-500">
                            Rostered: {player.roster_percentage}%
                          </div>
                          <div className="text-sm text-gray-500">
                            Budget: ${player.max_budget_per_card}
                          </div>
                          <div className="text-sm text-gray-500">
                            Cards: {player.cards_owned} owned, {player.cards_wanted} wanted
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(player.priority_level)}`}
                          title={`Priority ${player.priority_level}`}
                        />
                        
                        <select
                          value={player.collection_status}
                          onChange={(e) => updatePlayerStatus(player.id, e.target.value, player.priority_level)}
                          className={`text-xs px-2 py-1 rounded border-0 ${getStatusColor(player.collection_status)}`}
                        >
                          <option value="wanted">🎯 Wanted</option>
                          <option value="owned">✅ Owned</option>
                          <option value="multiple">📚 Multiple</option>
                          <option value="not_interested">❌ Not Interested</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 