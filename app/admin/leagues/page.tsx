'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Sport {
  id: string;
  name: string;
  abbreviation: string;
  active: boolean;
  created_at: string;
}

interface League {
  id: string;
  name: string;
  sport: Sport;
  season: string;
  status: 'active' | 'completed' | 'upcoming';
  total_teams: number;
  start_date: string;
  end_date?: string;
  commissioner_name?: string;
  commissioner_email?: string;
  settings: any;
  created_at: string;
}

interface Team {
  id: string;
  league_id: string;
  name: string;
  city?: string;
  abbreviation?: string;
  owner_name?: string;
  founded_year?: number;
  active: boolean;
  colors?: string[];
  logo_url?: string;
}

interface LeagueManagementData {
  leagues: League[];
  sports: Sport[];
  teams: Team[];
  total_leagues: number;
  active_leagues: number;
  total_teams: number;
}

export default function LeagueManagement() {
  const [data, setData] = useState<LeagueManagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leagues' | 'sports' | 'teams'>('leagues');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const itemsPerPage = 15;

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, sportFilter, statusFilter, activeTab]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        sport: sportFilter,
        status: statusFilter,
        tab: activeTab
      });

      const response = await fetch(`/api/admin/leagues?${params}`);
      if (response.ok) {
        const { data: responseData } = await response.json();
        setData(responseData);
      }
    } catch (error) {
      console.error('Error fetching league data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = data ? Math.ceil(data.total_leagues / itemsPerPage) : 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading league management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Leagues</p>
              <p className="text-2xl font-bold">{data?.total_leagues || 0}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Leagues</p>
              <p className="text-2xl font-bold">{data?.active_leagues || 0}</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Teams</p>
              <p className="text-2xl font-bold">{data?.total_teams || 0}</p>
            </div>
            <div className="text-3xl">🏈</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Sports</p>
              <p className="text-2xl font-bold">{data?.sports?.length || 0}</p>
            </div>
            <div className="text-3xl">⚽</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-8">
        <div className="flex border-b border-slate-200">
          {[
            { id: 'leagues', label: 'Leagues', icon: '🏆' },
            { id: 'sports', label: 'Sports', icon: '⚽' },
            { id: 'teams', label: 'Teams', icon: '🏈' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={`flex-1 p-4 text-center font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Search {activeTab}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search ${activeTab}...`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {activeTab === 'leagues' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sport
                  </label>
                  <select
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Sports</option>
                    {data?.sports?.map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Actions
              </label>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                ➕ Add {activeTab.slice(0, -1)}
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Clear
              </label>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSportFilter('all');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'leagues' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Leagues Management</h3>
            
            {data && data.leagues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">League</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Sport</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Season</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Teams</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Commissioner</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leagues.map((league) => (
                      <tr key={league.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold text-slate-800">{league.name}</div>
                            <div className="text-sm text-slate-500">
                              {new Date(league.start_date).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            {league.sport.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{league.season}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{league.total_teams}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadge(league.status)}`}>
                            {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="text-slate-800">{league.commissioner_name || 'N/A'}</div>
                            <div className="text-slate-500">{league.commissioner_email || ''}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View">
                              👁️
                            </button>
                            <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Edit">
                              ✏️
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Leagues Found</h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm 
                    ? 'No leagues match your search criteria.'
                    : 'Start by creating your first league!'
                  }
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  ➕ Create Your First League
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sports' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Sports Management</h3>
            
            {data && data.sports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.sports.map((sport) => (
                  <div key={sport.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">{sport.name}</h4>
                      <span className="text-2xl">⚽</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      Abbreviation: <span className="font-medium">{sport.abbreviation}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">
                      Created: {new Date(sport.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sport.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {sport.active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          ✏️
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚽</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Sports Found</h3>
                <p className="text-slate-500 mb-6">Add sports to manage leagues and teams.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  ➕ Add Your First Sport
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Teams Management</h3>
            
            {data && data.teams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.teams.map((team) => (
                  <div key={team.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-800">{team.name}</h4>
                      <span className="text-2xl">🏈</span>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      {team.city && <div>City: {team.city}</div>}
                      {team.abbreviation && <div>Abbr: {team.abbreviation}</div>}
                      {team.owner_name && <div>Owner: {team.owner_name}</div>}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        team.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {team.active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex space-x-1">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          ✏️
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏈</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Teams Found</h3>
                <p className="text-slate-500 mb-6">Add teams to organize your leagues.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  ➕ Add Your First Team
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
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

      {/* Add Modal placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Add New {activeTab.slice(0, -1)}</h3>
            <p className="text-slate-600 mb-4">Form for creating {activeTab} will go here.</p>
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