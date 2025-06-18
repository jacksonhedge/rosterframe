'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SleeperService } from '../lib/sleeper-service';
import {
  UserSeasonSummary,
  WeeklyPerformance,
  SleeperPlayer,
} from '../lib/sleeper-types';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSummary: UserSeasonSummary | null;
  players: Record<string, SleeperPlayer>;
  leagueName: string;
}

export default function UserDetailModal({
  isOpen,
  onClose,
  userSummary,
  players,
  leagueName,
}: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'playoffs' | 'roster'>('overview');

  if (!isOpen || !userSummary) return null;

  const { user, roster, weeklyPerformance, playoffResults, seasonStats } = userSummary;

  const getPlayerName = (playerId: string): string => {
    const player = players[playerId];
    if (!player) return 'Unknown Player';
    if (player.full_name) return player.full_name;
    if (player.first_name && player.last_name) {
      return `${player.first_name} ${player.last_name}`;
    }
    return player.first_name || player.last_name || 'Unknown Player';
  };

  const getPlayerPosition = (playerId: string): string => {
    const player = players[playerId];
    return player?.position || 'N/A';
  };

  const formatWeeklyChart = () => {
    const maxPoints = Math.max(...weeklyPerformance.map(w => w.points), 150);
    return weeklyPerformance.map(week => ({
      ...week,
      heightPercent: (week.points / maxPoints) * 100,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user.avatar && (
                <Image
                  src={SleeperService.getAvatarURL(user.avatar) || ''}
                  alt={`${user.displayName} avatar`}
                  width={60}
                  height={60}
                  className="rounded-full border-2 border-white"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{user.displayName}</h2>
                <p className="text-purple-100">{user.teamName || 'Team Manager'}</p>
                <p className="text-purple-200 text-sm">{leagueName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'weekly', label: 'Weekly Performance', icon: '📈' },
              { key: 'playoffs', label: 'Playoffs', icon: '🏆' },
              { key: 'roster', label: 'Current Roster', icon: '👥' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Season Record */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Season Record</h3>
                  <p className="text-3xl font-bold text-green-600">{roster.record}</p>
                  <p className="text-sm text-green-700">{roster.points} total points</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Average Points</h3>
                  <p className="text-3xl font-bold text-blue-600">{seasonStats.average_points}</p>
                  <p className="text-sm text-blue-700">per week</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Consistency</h3>
                  <p className="text-3xl font-bold text-purple-600">{seasonStats.consistency_score}%</p>
                  <p className="text-sm text-purple-700">reliability score</p>
                </div>
              </div>

              {/* Weekly Highs and Lows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔥 Best Week</h3>
                  <p className="text-2xl font-bold text-yellow-600">{seasonStats.highest_week} points</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">📉 Worst Week</h3>
                  <p className="text-2xl font-bold text-gray-600">{seasonStats.lowest_week} points</p>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Performance Tab */}
          {activeTab === 'weekly' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Week-by-Week Performance</h3>
              
              {/* Weekly Chart */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-end justify-between h-64 space-x-1">
                  {formatWeeklyChart().map((week) => (
                    <div key={week.week} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          week.is_win ? 'bg-green-500' : week.is_tie ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${week.heightPercent}%` }}
                        title={`Week ${week.week}: ${week.points} pts ${week.is_win ? '(W)' : week.is_tie ? '(T)' : '(L)'}`}
                      />
                      <span className="text-xs text-gray-600 mt-1">W{week.week}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-2 space-x-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                    <span>Win</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                    <span>Loss</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                    <span>Tie</span>
                  </div>
                </div>
              </div>

              {/* Weekly Details */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {weeklyPerformance.map((week) => (
                  <div
                    key={week.week}
                    className={`p-4 rounded-lg border ${
                      week.is_win
                        ? 'bg-green-50 border-green-200'
                        : week.is_tie
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">
                          Week {week.week} {week.is_playoff ? '(Playoffs)' : ''}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {week.points} pts vs {week.opponent_points || 'BYE'} pts
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        week.is_win
                          ? 'bg-green-100 text-green-800'
                          : week.is_tie
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {week.is_win ? 'W' : week.is_tie ? 'T' : 'L'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Playoffs Tab */}
          {activeTab === 'playoffs' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Playoff Performance</h3>
              
              {playoffResults ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-800 mb-4">Playoff Status</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600">Made Playoffs</p>
                        <p className="text-xl font-bold text-blue-800">
                          {playoffResults.made_playoffs ? 'Yes' : 'No'}
                        </p>
                      </div>
                      {playoffResults.playoff_seed && (
                        <div>
                          <p className="text-sm text-blue-600">Playoff Seed</p>
                          <p className="text-xl font-bold text-blue-800">#{playoffResults.playoff_seed}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {playoffResults.championship_result && (
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                      <h4 className="text-lg font-semibold text-yellow-800 mb-2">Championship Result</h4>
                      <p className="text-2xl font-bold text-yellow-600 capitalize">
                        {playoffResults.championship_result === 'won' ? '🏆 Champion!' : 
                         playoffResults.championship_result === 'lost' ? '🥈 Runner-up' :
                         playoffResults.championship_result === 'third' ? '🥉 Third Place' : 
                         '4th Place'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⏳</div>
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">Playoffs Not Started</h4>
                  <p className="text-gray-500">Playoff data will be available once the postseason begins</p>
                </div>
              )}
            </div>
          )}

          {/* Roster Tab */}
          {activeTab === 'roster' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Current Roster</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Starters */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Starting Lineup</h4>
                  <div className="space-y-2">
                    {roster.starters.slice(0, 10).map((playerId, index) => {
                      const playerName = getPlayerName(playerId);
                      const position = getPlayerPosition(playerId);
                      return (
                        <div key={`${playerId}-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                          <span className="font-medium text-gray-900">{playerName}</span>
                          <span 
                            className="px-2 py-1 text-xs font-semibold rounded text-white"
                            style={{ backgroundColor: SleeperService.getInstance().getPositionColor(position) }}
                          >
                            {position}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bench */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Bench</h4>
                  <div className="space-y-2">
                    {roster.players
                      .filter(playerId => !roster.starters.includes(playerId))
                      .slice(0, 8)
                      .map((playerId) => {
                        const playerName = getPlayerName(playerId);
                        const position = getPlayerPosition(playerId);
                        return (
                          <div key={playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 opacity-75">
                            <span className="text-gray-700">{playerName}</span>
                            <span 
                              className="px-2 py-1 text-xs font-semibold rounded text-white"
                              style={{ backgroundColor: SleeperService.getInstance().getPositionColor(position) }}
                            >
                              {position}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 