'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import sleeperService, { SleeperService } from '../lib/sleeper-service';
import UserDetailModal from '../components/UserDetailModal';
import {
  SleeperUser,
  SleeperLeague,
  ProcessedUser,
  ProcessedRoster,
  LeagueStanding,
  SleeperPlayer,
  UserSeasonSummary,
  SleeperDraft,
  ProcessedDraftPick,
} from '../lib/sleeper-types';

interface SleeperState {
  user: SleeperUser | null;
  leagues: SleeperLeague[];
  leaguesByYear: Record<string, SleeperLeague[]>;
  selectedLeague: SleeperLeague | null;
  leagueUsers: ProcessedUser[];
  standings: LeagueStanding[];
  userRoster: ProcessedRoster | null;
  players: Record<string, SleeperPlayer>;
  seasonSummaries: UserSeasonSummary[];
  isAdvancedDataLoaded: boolean;
  playoffBrackets: any;
  champion: ProcessedUser | null;
  drafts: SleeperDraft[];
  draftPicks: ProcessedDraftPick[];
  showDraft: boolean;
  supabaseSaving: boolean;
  supabaseSaveResults: Record<string, any>;
}

export default function SecretSleeperPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'leagues' | 'league-detail'>('input');
  const [selectedUserModal, setSelectedUserModal] = useState<UserSeasonSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [sleeperData, setSleeperData] = useState<SleeperState>({
    user: null,
    leagues: [],
    leaguesByYear: {},
    selectedLeague: null,
    leagueUsers: [],
    standings: [],
    userRoster: null,
    players: {},
    seasonSummaries: [],
    isAdvancedDataLoaded: false,
    playoffBrackets: null,
    champion: null,
    drafts: [],
    draftPicks: [],
    showDraft: false,
    supabaseSaving: false,
    supabaseSaveResults: {}
  });

  // Fetch user and their leagues for multiple years
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Step 1: Get user by username
      const userResponse = await sleeperService.getUser(username.trim());
      if (!userResponse.success) {
        setError(userResponse.error || 'User not found');
        setLoading(false);
        return;
      }

      const user = userResponse.data!;
      
      // Step 2: Get user's leagues for multiple years
      const years = ['2025', '2024', '2023', '2022', '2021'];
      const leaguePromises = years.map(year => 
        sleeperService.getUserLeagues(user.user_id, year, 'nfl')
      );
      
      const leagueResponses = await Promise.all(leaguePromises);
      
      const leaguesByYear: Record<string, SleeperLeague[]> = {};
      const allLeagues: SleeperLeague[] = [];
      
      years.forEach((year, index) => {
        const response = leagueResponses[index];
        if (response.success && response.data) {
          leaguesByYear[year] = response.data;
          allLeagues.push(...response.data);
        } else {
          leaguesByYear[year] = [];
        }
      });

      if (allLeagues.length === 0) {
        setError('No leagues found for any of the recent years');
        setLoading(false);
        return;
      }
      
      setSleeperData(prev => ({
        ...prev,
        user,
        leagues: allLeagues,
        leaguesByYear,
      }));
      
      setStep('leagues');
      setLoading(false);
      
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Select a league and fetch detailed data
  const selectLeague = async (league: SleeperLeague) => {
    setLoading(true);
    setError('');

    try {
      // Fetch league users and rosters in parallel
      const [usersResponse, rostersResponse, playersResponse] = await Promise.all([
        sleeperService.getLeagueUsers(league.league_id),
        sleeperService.getLeagueRosters(league.league_id),
        sleeperService.getPlayers(),
      ]);

      if (!usersResponse.success) {
        setError('Failed to fetch league users');
        setLoading(false);
        return;
      }

      if (!rostersResponse.success) {
        setError('Failed to fetch league rosters');
        setLoading(false);
        return;
      }

      const rawUsers = usersResponse.data!;
      const rawRosters = rostersResponse.data!;
      const players = playersResponse.data || {};

      // Process the data
      const processedUsers = sleeperService.processUsers(rawUsers);
      const processedRosters = sleeperService.processRosters(rawRosters, processedUsers);
      const standings = sleeperService.calculateStandings(processedRosters, processedUsers);

      // Find the current user's roster
      const userRoster = processedRosters.find(roster => 
        roster.ownerId === sleeperData.user?.user_id
      ) || null;

      // Try to fetch playoff brackets to determine actual champion
      let champion: ProcessedUser | null = null;
      let playoffBrackets: any = null;
      
      try {
        const bracketsResponse = await sleeperService.getPlayoffBrackets(league.league_id);
        if (bracketsResponse.success && bracketsResponse.data) {
          playoffBrackets = bracketsResponse.data;
          console.log('Playoff brackets data:', playoffBrackets);
          champion = findChampionFromBrackets(playoffBrackets, processedUsers, processedRosters);
          if (champion) {
            console.log('Champion found:', champion.displayName);
          } else {
            console.log('No champion found in brackets (playoffs may not be finished)');
          }
        }
      } catch (err) {
        console.log('Playoff data not available (league may not have finished)');
      }

      setSleeperData(prev => ({
        ...prev,
        selectedLeague: league,
        leagueUsers: processedUsers,
        standings,
        userRoster,
        players,
        playoffBrackets,
        champion,
        isAdvancedDataLoaded: true,
      }));

      setStep('league-detail');
      setLoading(false);

    } catch (err) {
      setError('Failed to load league details');
      setLoading(false);
    }
  };

  // Helper function to find champion from playoff brackets
  const findChampionFromBrackets = (brackets: any, users: ProcessedUser[], rosters: ProcessedRoster[]): ProcessedUser | null => {
    if (!brackets || !brackets.winners) {
      console.log('No winners bracket found');
      return null;
    }
    
    try {
      console.log('Winners bracket matches:', brackets.winners.length);
      
      // Find the championship match (highest round number)
      const championshipMatch = brackets.winners.reduce((latest: any, match: any) => {
        console.log(`Match: Round ${match.r}, Match ID ${match.m}, Winner: ${match.w}, t1: ${match.t1}, t2: ${match.t2}`);
        if (!latest || match.r > latest.r) {
          return match;
        }
        return latest;
      }, null);

      if (championshipMatch) {
        console.log('Championship match found:', championshipMatch);
        
        if (championshipMatch.w) {
          // The 'w' field contains the roster_id of the winner
          const championRoster = rosters.find(r => r.rosterId === championshipMatch.w);
          console.log('Champion roster:', championRoster);
          
          if (championRoster) {
            const championUser = users.find(u => u.userId === championRoster.ownerId);
            console.log('Champion user:', championUser);
            return championUser || null;
          }
        } else {
          console.log('Championship match has no winner yet (playoffs not finished)');
        }
      } else {
        console.log('No championship match found');
      }
    } catch (err) {
      console.log('Error parsing championship data:', err);
    }
    
    return null;
  };

  const resetToInput = () => {
    setStep('input');
    setUsername('');
    setSleeperData({
      user: null,
      leagues: [],
      leaguesByYear: {},
      selectedLeague: null,
      leagueUsers: [],
      standings: [],
      userRoster: null,
      players: {},
      seasonSummaries: [],
      isAdvancedDataLoaded: false,
      playoffBrackets: null,
      champion: null,
      drafts: [],
      draftPicks: [],
      showDraft: false,
      supabaseSaving: false,
      supabaseSaveResults: {}
    });
  };

  const getPlayerName = (playerId: string): string => {
    const player = sleeperData.players[playerId];
    if (!player) return 'Unknown Player';
    return sleeperService.formatPlayerName(player);
  };

  const getPlayerPosition = (playerId: string): string => {
    const player = sleeperData.players[playerId];
    return player?.position || 'N/A';
  };

  // Convert LeagueStanding to UserSeasonSummary for the modal
  const createUserSummary = (standing: LeagueStanding): UserSeasonSummary => {
    return {
      user: standing.user,
      roster: standing.roster,
      weeklyPerformance: [], // We don't have weekly data in this view
      playoffResults: undefined, // We don't have playoff data in this view
      seasonStats: {
        average_points: Math.round(standing.roster.points / 14), // Assume 14 weeks
        highest_week: 0, // We don't have this data
        lowest_week: 0, // We don't have this data
        consistency_score: 85, // Placeholder
        head_to_head_record: {}, // We don't have head-to-head data in this view
      },
    };
  };

  const handleUserClick = (standing: LeagueStanding) => {
    const userSummary = createUserSummary(standing);
    setSelectedUserModal(userSummary);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserModal(null);
  };

  // Fetch and display draft data
  const handleLeagueDraft = async () => {
    if (!sleeperData.selectedLeague) return;
    
    setLoading(true);
    setError('');

    try {
      const draftResponse = await sleeperService.getCompleteDraftData(sleeperData.selectedLeague.league_id);
      
      if (!draftResponse.success) {
        setError(draftResponse.error || 'Failed to fetch draft data');
        setLoading(false);
        return;
      }

      const { drafts, picks } = draftResponse.data!;
      
      setSleeperData(prev => ({
        ...prev,
        drafts,
        draftPicks: picks,
        showDraft: true,
      }));

      setLoading(false);

    } catch (err) {
      setError('Failed to load draft data');
      setLoading(false);
    }
  };

  const closeDraft = () => {
    setSleeperData(prev => ({
      ...prev,
      showDraft: false,
    }));
  };

  // Handle showing draft picks
  const handleShowDraft = async () => {
    if (!sleeperData.selectedLeague) return;

    setSleeperData(prev => ({ ...prev, showDraft: !prev.showDraft }));
  };

  // Save individual league to Supabase
  const saveLeagueToSupabase = async (league: SleeperLeague, season: string) => {
    try {
      setSleeperData(prev => ({ ...prev, supabaseSaving: true }));

      // Find all data for this league
      const leagueUsers = sleeperData.leagueUsers;
      const processedRosters = sleeperData.standings.map(s => s.roster);
      const standings = sleeperData.standings;
      const champion = sleeperData.champion;
      const playoffBrackets = sleeperData.playoffBrackets;
      const players = sleeperData.players;

      const response = await fetch('/api/supabase/save-league', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          league,
          season,
          users: leagueUsers,
          rosters: processedRosters,
          standings,
          champion,
          playoffBrackets,
          players
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSleeperData(prev => ({
          ...prev,
          supabaseSaveResults: {
            ...prev.supabaseSaveResults,
            [`${league.league_id}-${season}`]: {
              success: true,
              message: result.message,
              skipped: result.skipped
            }
          }
        }));

        alert(result.skipped ? 
          `League "${league.name}" already exists in database` : 
          `Successfully saved league "${league.name}" to database!`
        );
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error saving league to Supabase:', error);
      setSleeperData(prev => ({
        ...prev,
        supabaseSaveResults: {
          ...prev.supabaseSaveResults,
          [`${league.league_id}-${season}`]: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }));
      alert(`Failed to save league: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSleeperData(prev => ({ ...prev, supabaseSaving: false }));
    }
  };

  // Batch save all leagues to Supabase
  const saveAllLeaguesToSupabase = async () => {
    try {
      setSleeperData(prev => ({ ...prev, supabaseSaving: true }));

      // For now, just save the currently selected league
      // In a full implementation, you'd need to fetch data for all leagues
      if (sleeperData.selectedLeague && sleeperData.isAdvancedDataLoaded) {
        await saveLeagueToSupabase(sleeperData.selectedLeague, sleeperData.selectedLeague.season);
      } else {
        alert('Please select and load a league first to test the save functionality');
      }

    } catch (error) {
      console.error('Error batch saving leagues:', error);
      alert(`Failed to batch save leagues: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSleeperData(prev => ({ ...prev, supabaseSaving: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">Roster Frame</span>
            </Link>
            <div className="text-purple-600 font-semibold">🏈 Secret Sleeper</div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              🏈
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Secret Sleeper</h1>
          <p className="text-lg text-gray-600 mb-4">
            Enter your Sleeper username to view your fantasy leagues, standings, and roster
          </p>
          
          {/* Network Analysis Button */}
          <div className="flex justify-center">
            <Link
              href="/sleeper-code-graph"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              🕸️ Network Analysis
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v4m0 0h-4" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Step 1: Username Input */}
        {step === 'input' && (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Sleeper Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your Sleeper username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  'Find My Leagues'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: League Selection */}
        {step === 'leagues' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Leagues</h2>
                <p className="text-gray-600">
                  Found {sleeperData.leagues.length} league{sleeperData.leagues.length !== 1 ? 's' : ''} for {sleeperData.user?.display_name || sleeperData.user?.username}
                </p>
              </div>
              <button
                onClick={resetToInput}
                className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Search Again
              </button>
            </div>

            {/* Leagues organized by year */}
            <div className="space-y-8">
              {['2025', '2024', '2023', '2022', '2021'].map((year) => {
                const yearLeagues = sleeperData.leaguesByYear[year] || [];
                if (yearLeagues.length === 0) return null;

                return (
                  <div key={year} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-900">{year} Season</h3>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                        {yearLeagues.length} league{yearLeagues.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {yearLeagues.map((league) => (
                        <div
                          key={league.league_id}
                          onClick={() => selectLeague(league)}
                          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-purple-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{league.name}</h4>
                              <p className="text-sm text-gray-500">
                                {league.total_rosters} teams • {league.season} season
                              </p>
                            </div>
                            {league.avatar && (
                              <Image
                                src={SleeperService.getLeagueAvatarURL(league.avatar) || ''}
                                alt={`${league.name} avatar`}
                                width={40}
                                height={40}
                                className="rounded-lg"
                              />
                            )}
                          </div>
                          <div className="flex items-center text-purple-600">
                            <span className="text-sm font-medium">View League Details</span>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: League Details */}
        {step === 'league-detail' && sleeperData.selectedLeague && (
          <div className="space-y-8">
            {/* League Header */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {sleeperData.selectedLeague.name}
                    </h2>
                    <p className="text-gray-600">
                      {sleeperData.selectedLeague.season} • {sleeperData.selectedLeague.total_rosters} teams
                    </p>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setStep('leagues')}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        ← Back to Leagues
                      </button>
                      {sleeperData.isAdvancedDataLoaded && (
                        <button
                          onClick={handleShowDraft}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {sleeperData.showDraft ? 'Hide Draft' : 'Show League Draft'}
                        </button>
                      )}
                    </div>
                    {sleeperData.isAdvancedDataLoaded && (
                      <button
                        onClick={() => saveLeagueToSupabase(sleeperData.selectedLeague!, sleeperData.selectedLeague!.season)}
                        disabled={sleeperData.supabaseSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 w-fit"
                      >
                        {sleeperData.supabaseSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Save to Database</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* League Standings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🏆</span>
                  League Standings
                </h3>
                
                {/* Champion Banner */}
                {sleeperData.champion && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">👑</span>
                      <div>
                        <p className="text-lg font-bold text-yellow-800">League Champion</p>
                        <p className="text-yellow-700">{sleeperData.champion.displayName}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {sleeperData.standings.map((standing) => (
                    <div
                      key={standing.user.userId}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        standing.user.userId === sleeperData.user?.user_id
                          ? 'bg-purple-50 border-purple-200'
                          : standing.user.userId === sleeperData.champion?.userId
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          standing.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {standing.rank}
                        </div>
                        <div 
                          className="flex items-center space-x-2 cursor-pointer hover:bg-white hover:bg-opacity-50 rounded-lg p-2 transition-colors"
                          onClick={() => handleUserClick(standing)}
                        >
                          {standing.user.avatar && (
                            <Image
                              src={SleeperService.getAvatarURL(standing.user.avatar) || ''}
                              alt={`${standing.user.displayName} avatar`}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900 hover:text-purple-600 transition-colors">
                                {standing.user.displayName}
                              </p>
                              {standing.user.userId === sleeperData.champion?.userId && (
                                <span className="text-lg">👑</span>
                              )}
                            </div>
                            {standing.user.teamName && (
                              <p className="text-xs text-gray-500">{standing.user.teamName}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{standing.roster.record}</p>
                        <p className="text-sm text-gray-500">{standing.roster.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Roster */}
              {sleeperData.userRoster && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">👤</span>
                    Your Roster
                  </h3>
                  
                  {/* Roster Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-purple-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{sleeperData.userRoster.record}</p>
                      <p className="text-sm text-gray-600">Record</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{sleeperData.userRoster.points}</p>
                      <p className="text-sm text-gray-600">Points For</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{sleeperData.userRoster.pointsAgainst}</p>
                      <p className="text-sm text-gray-600">Points Against</p>
                    </div>
                  </div>

                  {/* Starting Lineup */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Starting Lineup</h4>
                    <div className="space-y-2">
                      {sleeperData.userRoster.starters.slice(0, 10).map((playerId, index) => {
                        const playerName = getPlayerName(playerId);
                        const position = getPlayerPosition(playerId);
                        return (
                          <div key={`${playerId}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium text-gray-900">{playerName}</span>
                            <span 
                              className="px-2 py-1 text-xs font-semibold rounded text-white"
                              style={{ backgroundColor: sleeperService.getPositionColor(position) }}
                            >
                              {position}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bench Players */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Bench</h4>
                    <div className="space-y-2">
                      {sleeperData.userRoster.players
                        .filter(playerId => !sleeperData.userRoster!.starters.includes(playerId))
                        .slice(0, 8)
                        .map((playerId) => {
                          const playerName = getPlayerName(playerId);
                          const position = getPlayerPosition(playerId);
                          return (
                            <div key={playerId} className="flex items-center justify-between p-2 bg-gray-50 rounded opacity-75">
                              <span className="text-gray-700">{playerName}</span>
                              <span 
                                className="px-2 py-1 text-xs font-semibold rounded text-white"
                                style={{ backgroundColor: sleeperService.getPositionColor(position) }}
                              >
                                {position}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && step !== 'input' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="text-lg font-medium">Loading league data...</span>
            </div>
          </div>
        )}

        {/* Draft Modal */}
        {sleeperData.showDraft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Draft Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">🎯 League Draft</h2>
                    <p className="text-green-100">{sleeperData.selectedLeague?.name}</p>
                    <p className="text-green-200 text-sm">
                      {sleeperData.draftPicks.length} picks • {Math.max(...sleeperData.draftPicks.map(p => p.round))} rounds
                    </p>
                  </div>
                  <button
                    onClick={closeDraft}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Draft Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {sleeperData.draftPicks.length > 0 ? (
                  <div className="space-y-6">
                    {/* Draft by Rounds */}
                    {Array.from({ length: Math.max(...sleeperData.draftPicks.map(p => p.round)) }, (_, i) => i + 1).map((round) => {
                      const roundPicks = sleeperData.draftPicks.filter(pick => pick.round === round);
                      
                      return (
                        <div key={round} className="space-y-3">
                          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
                            Round {round}
                          </h3>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {roundPicks.map((pick) => (
                              <div key={pick.pick_no} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-500">
                                    Pick #{pick.pick_no} ({pick.pick_in_round}.{round})
                                  </span>
                                  <span 
                                    className="px-2 py-1 text-xs font-semibold rounded text-white"
                                    style={{ backgroundColor: sleeperService.getPositionColor(pick.player_position) }}
                                  >
                                    {pick.player_position}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{pick.player_name}</p>
                                  <p className="text-sm text-gray-600">{pick.player_team}</p>
                                  <p className="text-sm text-purple-600 font-medium">{pick.owner_name}</p>
                                  {pick.is_keeper && (
                                    <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                                      Keeper
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No Draft Data</h4>
                    <p className="text-gray-500">No draft picks found for this league</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        <UserDetailModal
          isOpen={isModalOpen}
          onClose={closeModal}
          userSummary={selectedUserModal}
          players={sleeperData.players}
          leagueName={sleeperData.selectedLeague?.name || ''}
        />
      </div>
    </div>
  );
} 