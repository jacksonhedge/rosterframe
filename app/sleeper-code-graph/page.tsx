'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import sleeperService, { SleeperService } from '../lib/sleeper-service';
import {
  SleeperUser,
  SleeperLeague,
  ProcessedUser,
  ProcessedRoster,
  LeagueStanding,
  SleeperPlayer,
} from '../lib/sleeper-types';

interface NetworkNode {
  id: string;
  type: 'user' | 'league';
  label: string;
  data: SleeperUser | SleeperLeague;
  level: number;
  processed: boolean;
}

interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: 'member_of';
}

interface NetworkGraph {
  nodes: Map<string, NetworkNode>;
  edges: Map<string, NetworkEdge>;
}

interface GraphStats {
  totalUsers: number;
  totalLeagues: number;
  totalConnections: number;
  maxLevel: number;
  processingComplete: boolean;
  networkDensity: number;
  averageConnections: number;
  clusters: number;
}

interface NetworkCluster {
  id: string;
  nodes: string[];
  centrality: number;
  density: number;
}

interface GraphExportData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  stats: GraphStats;
  clusters: NetworkCluster[];
  metadata: {
    startingUser: string;
    generatedAt: string;
    maxLevels: number;
    totalProcessingTime: number;
  };
}

export default function SleeperCodeGraphPage() {
  const [startUsername, setStartUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [graph, setGraph] = useState<NetworkGraph>({
    nodes: new Map(),
    edges: new Map()
  });
  const [stats, setStats] = useState<GraphStats>({
    totalUsers: 0,
    totalLeagues: 0,
    totalConnections: 0,
    maxLevel: 0,
    processingComplete: false,
    networkDensity: 0,
    averageConnections: 0,
    clusters: 0
  });
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [maxLevels, setMaxLevels] = useState(3); // Limit depth to prevent infinite expansion
  const [maxNodesPerLevel, setMaxNodesPerLevel] = useState(50); // Limit nodes per level
  const [clusters, setClusters] = useState<NetworkCluster[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedLeagueModal, setSelectedLeagueModal] = useState<any>(null);
  const [leagueModalData, setLeagueModalData] = useState<{
    users: any[];
    rosters: any[];
    standings: any[];
    players: Record<string, any>;
    loading: boolean;
  }>({
    users: [],
    rosters: [],
    standings: [],
    players: {},
    loading: false
  });
  const processingQueue = useRef<{nodeId: string, level: number}[]>([]);
  const processed = useRef<Set<string>>(new Set());
  const startTime = useRef<number>(0);
  const abortProcessing = useRef<boolean>(false);

  const resetGraph = () => {
    setGraph({ nodes: new Map(), edges: new Map() });
    setStats({
      totalUsers: 0,
      totalLeagues: 0,
      totalConnections: 0,
      maxLevel: 0,
      processingComplete: false,
      networkDensity: 0,
      averageConnections: 0,
      clusters: 0
    });
    setSelectedNode(null);
    processingQueue.current = [];
    processed.current = new Set();
    abortProcessing.current = false;
    setClusters([]);
    setShowExportModal(false);
    setSelectedLeagueModal(null);
    setLeagueModalData({
      users: [],
      rosters: [],
      standings: [],
      players: {},
      loading: false
    });
  };

  // Generate network clusters for analysis
  const generateClusters = (): NetworkCluster[] => {
    const levelGroups = new Map<number, string[]>();
    
    Array.from(graph.nodes.values()).forEach(node => {
      if (!levelGroups.has(node.level)) {
        levelGroups.set(node.level, []);
      }
      levelGroups.get(node.level)!.push(node.id);
    });

    return Array.from(levelGroups.entries()).map(([level, nodeIds]) => {
      const connections = Array.from(graph.edges.values()).filter(
        edge => nodeIds.includes(edge.source) || nodeIds.includes(edge.target)
      );
      
      return {
        id: `cluster_level_${level}`,
        nodes: nodeIds,
        centrality: connections.length / Math.max(nodeIds.length, 1),
        density: nodeIds.length > 1 ? connections.length / (nodeIds.length * (nodeIds.length - 1) / 2) : 0
      };
    });
  };

  // Export graph data for MCP integration
  const exportGraphData = (): GraphExportData => {
    return {
      nodes: Array.from(graph.nodes.values()),
      edges: Array.from(graph.edges.values()),
      stats,
      clusters: generateClusters(),
      metadata: {
        startingUser: startUsername,
        generatedAt: new Date().toISOString(),
        maxLevels,
        totalProcessingTime: Date.now() - startTime.current
      }
    };
  };

  // Copy graph data to clipboard for MCP tools
  const copyToClipboard = async (format: 'json' | 'csv' | 'mcp') => {
    const graphData = exportGraphData();
    let content = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(graphData, null, 2);
        break;
      case 'csv':
        // Create CSV format for nodes and edges
        const nodesCsv = 'id,type,label,level,processed\n' + 
          graphData.nodes.map(n => `${n.id},${n.type},${n.label},${n.level},${n.processed}`).join('\n');
        const edgesCsv = '\n\nid,source,target,type\n' + 
          graphData.edges.map(e => `${e.id},${e.source},${e.target},${e.type}`).join('\n');
        content = nodesCsv + edgesCsv;
        break;
      case 'mcp':
        // Format for MCP analysis tools
        content = JSON.stringify({
          type: 'sleeper_network_graph',
          timestamp: graphData.metadata.generatedAt,
          network: {
            nodes: graphData.nodes.length,
            edges: graphData.edges.length,
            levels: stats.maxLevel + 1,
            density: stats.networkDensity,
            clusters: graphData.clusters.length
          },
          data: graphData
        }, null, 2);
        break;
    }

    try {
      await navigator.clipboard.writeText(content);
      alert(`Graph data copied to clipboard in ${format.toUpperCase()} format!`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    }
  };

  // Handle clicking on a league node to show detailed view
  const handleLeagueNodeClick = async (leagueNode: NetworkNode) => {
    if (leagueNode.type !== 'league') return;
    
    const leagueData = leagueNode.data as SleeperLeague;
    setSelectedLeagueModal(leagueData);
    setLeagueModalData(prev => ({ ...prev, loading: true }));

    try {
      // Fetch league users, rosters, and players in parallel
      const [usersResponse, rostersResponse, playersResponse] = await Promise.all([
        sleeperService.getLeagueUsers(leagueData.league_id),
        sleeperService.getLeagueRosters(leagueData.league_id),
        sleeperService.getPlayers(),
      ]);

      if (!usersResponse.success || !rostersResponse.success) {
        throw new Error('Failed to fetch league data');
      }

      const rawUsers = usersResponse.data!;
      const rawRosters = rostersResponse.data!;
      const players = playersResponse.data || {};

      // Process the data using sleeper service
      const processedUsers = sleeperService.processUsers(rawUsers);
      const processedRosters = sleeperService.processRosters(rawRosters, processedUsers);
      const standings = sleeperService.calculateStandings(processedRosters, processedUsers);

      setLeagueModalData({
        users: processedUsers,
        rosters: processedRosters,
        standings,
        players,
        loading: false
      });

    } catch (err) {
      console.error('Error fetching league details:', err);
      setLeagueModalData(prev => ({ ...prev, loading: false }));
      alert('Failed to load league details');
    }
  };

  const closeLeagueModal = () => {
    setSelectedLeagueModal(null);
    setLeagueModalData({
      users: [],
      rosters: [],
      standings: [],
      players: {},
      loading: false
    });
  };

  const getPlayerName = (playerId: string): string => {
    const player = leagueModalData.players[playerId];
    if (!player) return 'Unknown Player';
    return sleeperService.formatPlayerName(player);
  };

  const getPlayerPosition = (playerId: string): string => {
    const player = leagueModalData.players[playerId];
    return player?.position || 'N/A';
  };

  const addNode = (node: NetworkNode) => {
    setGraph(prev => {
      const newNodes = new Map(prev.nodes);
      newNodes.set(node.id, node);
      return { ...prev, nodes: newNodes };
    });
  };

  const addEdge = (edge: NetworkEdge) => {
    setGraph(prev => {
      const newEdges = new Map(prev.edges);
      newEdges.set(edge.id, edge);
      return { ...prev, edges: newEdges };
    });
  };

  const updateStats = () => {
    setStats(prev => {
      const users = Array.from(graph.nodes.values()).filter(n => n.type === 'user');
      const leagues = Array.from(graph.nodes.values()).filter(n => n.type === 'league');
      const maxLevel = Math.max(...Array.from(graph.nodes.values()).map(n => n.level), 0);
      const totalNodes = graph.nodes.size;
      const totalEdges = graph.edges.size;
      
      // Calculate network density (actual edges / possible edges)
      const possibleEdges = totalNodes > 1 ? totalNodes * (totalNodes - 1) / 2 : 0;
      const networkDensity = possibleEdges > 0 ? (totalEdges / possibleEdges) * 100 : 0;
      
      // Calculate average connections per node
      const averageConnections = totalNodes > 0 ? (totalEdges * 2) / totalNodes : 0;
      
      // Simple cluster estimation (nodes grouped by levels)
      const clusters = maxLevel + 1;
      
      return {
        totalUsers: users.length,
        totalLeagues: leagues.length,
        totalConnections: totalEdges,
        maxLevel,
        processingComplete: prev.processingComplete,
        networkDensity: Math.round(networkDensity * 100) / 100,
        averageConnections: Math.round(averageConnections * 100) / 100,
        clusters
      };
    });
  };

  useEffect(() => {
    updateStats();
  }, [graph]);

  const processUserNode = async (userId: string, level: number): Promise<void> => {
    if (level > maxLevels || processed.current.has(`user_${userId}`) || abortProcessing.current) {
      return;
    }

    processed.current.add(`user_${userId}`);

    try {
      // Get user's leagues for current year
      const leaguesResponse = await sleeperService.getUserLeagues(userId, '2024', 'nfl');
      
      if (leaguesResponse.success && leaguesResponse.data && !abortProcessing.current) {
        const leagues = leaguesResponse.data.slice(0, maxNodesPerLevel); // Limit leagues per user
        
        for (const league of leagues) {
          if (abortProcessing.current) break;
          
          const leagueNodeId = `league_${league.league_id}`;
          const userNodeId = `user_${userId}`;
          
          // Add league node if not exists
          if (!graph.nodes.has(leagueNodeId)) {
            const leagueNode: NetworkNode = {
              id: leagueNodeId,
              type: 'league',
              label: league.name || `League ${league.league_id}`,
              data: league,
              level: level + 1,
              processed: false
            };
            addNode(leagueNode);
            
            // Queue league for processing
            if (!abortProcessing.current) {
              processingQueue.current.push({ nodeId: leagueNodeId, level: level + 1 });
            }
          }
          
          // Add edge between user and league
          const edgeId = `${userNodeId}_${leagueNodeId}`;
          if (!graph.edges.has(edgeId)) {
            addEdge({
              id: edgeId,
              source: userNodeId,
              target: leagueNodeId,
              type: 'member_of'
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error processing user ${userId}:`, err);
    }
  };

  const processLeagueNode = async (leagueId: string, level: number): Promise<void> => {
    if (level > maxLevels || processed.current.has(`league_${leagueId}`) || abortProcessing.current) {
      return;
    }

    processed.current.add(`league_${leagueId}`);

    try {
      // Get league users
      const usersResponse = await sleeperService.getLeagueUsers(leagueId);
      
      if (usersResponse.success && usersResponse.data && !abortProcessing.current) {
        const users = usersResponse.data.slice(0, maxNodesPerLevel); // Limit users per league
        
        for (const user of users) {
          if (abortProcessing.current) break;
          
          const userNodeId = `user_${user.user_id}`;
          const leagueNodeId = `league_${leagueId}`;
          
          // Add user node if not exists
          if (!graph.nodes.has(userNodeId)) {
            const userNode: NetworkNode = {
              id: userNodeId,
              type: 'user',
              label: user.display_name || user.username || `User ${user.user_id}`,
              data: user,
              level: level + 1,
              processed: false
            };
            addNode(userNode);
            
            // Queue user for processing (but only if we haven't reached max level)
            if (level + 1 < maxLevels && !abortProcessing.current) {
              processingQueue.current.push({ nodeId: userNodeId, level: level + 1 });
            }
          }
          
          // Add edge between league and user
          const edgeId = `${leagueNodeId}_${userNodeId}`;
          if (!graph.edges.has(edgeId)) {
            addEdge({
              id: edgeId,
              source: leagueNodeId,
              target: userNodeId,
              type: 'member_of'
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error processing league ${leagueId}:`, err);
    }
  };

  const processQueue = async (): Promise<void> => {
    while (processingQueue.current.length > 0 && !abortProcessing.current) {
      const { nodeId, level } = processingQueue.current.shift()!;
      
      // Check for abort before processing each node
      if (abortProcessing.current) {
        break;
      }
      
      if (nodeId.startsWith('user_')) {
        const userId = nodeId.replace('user_', '');
        await processUserNode(userId, level);
      } else if (nodeId.startsWith('league_')) {
        const leagueId = nodeId.replace('league_', '');
        await processLeagueNode(leagueId, level);
      }
      
      // Check for abort before marking as processed
      if (abortProcessing.current) {
        break;
      }
      
      // Mark node as processed
      setGraph(prev => {
        const newNodes = new Map(prev.nodes);
        const node = newNodes.get(nodeId);
        if (node) {
          node.processed = true;
          newNodes.set(nodeId, node);
        }
        return { ...prev, nodes: newNodes };
      });
      
      // Small delay to prevent overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // If aborted, clear remaining queue
    if (abortProcessing.current) {
      processingQueue.current = [];
    }
    
    setStats(prev => ({ ...prev, processingComplete: true }));
    setClusters(generateClusters());
    setProcessing(false);
  };

  const startGraphAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startUsername.trim()) return;

    setLoading(true);
    setProcessing(true);
    setError('');
    resetGraph();
    startTime.current = Date.now();

    try {
      // Step 1: Get the starting user
      const userResponse = await sleeperService.getUser(startUsername.trim());
      if (!userResponse.success) {
        setError(userResponse.error || 'User not found');
        setLoading(false);
        setProcessing(false);
        return;
      }

      const startUser = userResponse.data!;
      
      // Add starting user node
      const startUserNode: NetworkNode = {
        id: `user_${startUser.user_id}`,
        type: 'user',
        label: startUser.display_name || startUser.username || `User ${startUser.user_id}`,
        data: startUser,
        level: 0,
        processed: false
      };
      
      addNode(startUserNode);
      
      // Queue starting user for processing
      processingQueue.current.push({ nodeId: startUserNode.id, level: 0 });
      
      setLoading(false);
      
      // Start processing the queue
      await processQueue();
      
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      setProcessing(false);
    }
  };

  // Stop/abort processing
  const stopProcessing = () => {
    abortProcessing.current = true;
    setProcessing(false);
    setStats(prev => ({ ...prev, processingComplete: true }));
    setClusters(generateClusters());
  };

  const renderNetworkList = () => {
    const nodes = Array.from(graph.nodes.values());
    const userNodes = nodes.filter(n => n.type === 'user').sort((a, b) => a.level - b.level);
    const leagueNodes = nodes.filter(n => n.type === 'league').sort((a, b) => a.level - b.level);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Users ({userNodes.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {userNodes.map(node => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedNode?.id === node.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                } ${node.processed ? 'opacity-100' : 'opacity-60'}`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{node.label}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Level {node.level}
                  </span>
                </div>
                {!node.processed && (
                  <div className="text-xs text-orange-600 mt-1">Processing...</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leagues */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Leagues ({leagueNodes.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {leagueNodes.map(node => (
              <div
                key={node.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedNode?.id === node.id 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-green-300'
                } ${node.processed ? 'opacity-100' : 'opacity-60'}`}
                onClick={() => setSelectedNode(node)}
                onDoubleClick={() => handleLeagueNodeClick(node)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{node.label}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Level {node.level}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {!node.processed && (
                    <div className="text-xs text-orange-600">Processing...</div>
                  )}
                  {node.processed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeagueNodeClick(node);
                      }}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      View League 🏈
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNodeDetails = () => {
    if (!selectedNode) return null;

    const nodeData = selectedNode.data as any;
    const connections = Array.from(graph.edges.values()).filter(
      edge => edge.source === selectedNode.id || edge.target === selectedNode.id
    );

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {selectedNode.type === 'user' ? '👤' : '🏈'} {selectedNode.label}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Type</div>
            <div className="font-medium capitalize">{selectedNode.type}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Level</div>
            <div className="font-medium">{selectedNode.level}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Connections</div>
            <div className="font-medium">{connections.length}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Status</div>
            <div className="font-medium">
              {selectedNode.processed ? '✅ Processed' : '⏳ Processing'}
            </div>
          </div>
        </div>

        {selectedNode.type === 'user' && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">User ID</div>
            <div className="font-mono text-sm bg-gray-100 p-2 rounded">
              {nodeData.user_id}
            </div>
            {nodeData.username && (
              <>
                <div className="text-sm text-gray-600">Username</div>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {nodeData.username}
                </div>
              </>
            )}
          </div>
        )}

        {selectedNode.type === 'league' && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">League ID</div>
            <div className="font-mono text-sm bg-gray-100 p-2 rounded">
              {nodeData.league_id}
            </div>
            <div className="text-sm text-gray-600">Season</div>
            <div className="font-mono text-sm bg-gray-100 p-2 rounded">
              {nodeData.season}
            </div>
            {nodeData.total_rosters && (
              <>
                <div className="text-sm text-gray-600">Total Teams</div>
                <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                  {nodeData.total_rosters}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">Roster Frame</span>
            </Link>
            <div className="text-indigo-600 font-semibold">🕸️ Sleeper Code Graph</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              🕸️
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sleeper Code Graph</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how fantasy football leagues are connected through shared users. 
            Enter a username to explore the network of interconnected leagues and players.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={startGraphAnalysis} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={startUsername}
                  onChange={(e) => setStartUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter Sleeper username..."
                  required
                />
              </div>
              <div className="sm:w-32">
                <label htmlFor="maxLevels" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Levels
                </label>
                <select
                  id="maxLevels"
                  value={maxLevels}
                  onChange={(e) => setMaxLevels(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from({ length: 100 }, (_, i) => i + 1).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div className="sm:w-32">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  &nbsp;
                </label>
                <button
                  type="submit"
                  disabled={loading || processing}
                  className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Starting...' : processing ? 'Processing...' : 'Start Analysis'}
                </button>
              </div>
              {processing && (
                <div className="sm:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    &nbsp;
                  </label>
                  <button
                    type="button"
                    onClick={stopProcessing}
                    className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🛑 Stop
                  </button>
                </div>
              )}
            </div>
          </form>
          
          {/* Instructions */}
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <strong>How it works:</strong> Starting from your username, the graph explores all leagues you're in, 
            then finds all users in those leagues, then explores their leagues, and so on. 
            Higher levels mean more network hops from the starting point.
            <br /><br />
            <strong>💡 Tip:</strong> Click on league nodes to see details, or click the "View League 🏈" button 
            to see complete standings and rosters for any league!
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        {(stats.totalUsers > 0 || stats.totalLeagues > 0) && (
          <div className="space-y-6 mb-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalLeagues}</div>
                <div className="text-sm text-gray-600">Leagues</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalConnections}</div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.maxLevel}</div>
                <div className="text-sm text-gray-600">Max Level</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className={`text-2xl font-bold ${stats.processingComplete ? 'text-green-600' : 'text-orange-600'}`}>
                  {stats.processingComplete ? '✅' : '⏳'}
                </div>
                <div className="text-sm text-gray-600">
                  {stats.processingComplete ? 'Complete' : 'Processing'}
                </div>
              </div>
            </div>

            {/* Advanced Network Stats */}
            {stats.processingComplete && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="text-xl font-bold text-indigo-600">{stats.networkDensity}%</div>
                  <div className="text-sm text-gray-600">Network Density</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="text-xl font-bold text-cyan-600">{stats.averageConnections}</div>
                  <div className="text-sm text-gray-600">Avg Connections</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <div className="text-xl font-bold text-rose-600">{stats.clusters}</div>
                  <div className="text-sm text-gray-600">Clusters</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <button
                    onClick={() => setShowExportModal(true)}
                    className="text-lg font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    📊 Export
                  </button>
                  <div className="text-sm text-gray-600">MCP Data</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Network Visualization */}
        {graph.nodes.size > 0 && (
          <div className="space-y-6">
            {renderNetworkList()}
            
            {/* Node Details */}
            {selectedNode && (
              <div className="mt-6">
                {renderNodeDetails()}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {graph.nodes.size === 0 && !loading && !processing && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🕸️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Network Data Yet</h3>
            <p className="text-gray-600">Enter a Sleeper username above to start exploring the league network.</p>
          </div>
        )}

        {/* Export Modal for MCP Integration */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">📊 Export Network Data</h2>
                    <p className="text-emerald-100">Export for CodeGPT MCP integration and analysis</p>
                  </div>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* JSON Export */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">JSON Format</h3>
                          <p className="text-sm text-gray-600">Complete graph data with nodes, edges, and metadata</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard('json')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Copy JSON
                        </button>
                      </div>
                    </div>

                    {/* CSV Export */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">CSV Format</h3>
                          <p className="text-sm text-gray-600">Tabular format for spreadsheet analysis</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard('csv')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Copy CSV
                        </button>
                      </div>
                    </div>

                    {/* MCP Format */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">🤖 MCP Integration Format</h3>
                          <p className="text-sm text-gray-600">Optimized for CodeGPT MCP tools and AI analysis</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard('mcp')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Copy MCP
                        </button>
                      </div>
                      <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                        <strong>MCP Usage:</strong> Paste this data into CodeGPT for advanced network analysis, 
                        visualization recommendations, and community detection.
                      </div>
                    </div>
                  </div>

                  {/* Network Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Network Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Nodes:</span>
                        <span className="font-medium ml-2">{stats.totalUsers + stats.totalLeagues}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Edges:</span>
                        <span className="font-medium ml-2">{stats.totalConnections}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Network Density:</span>
                        <span className="font-medium ml-2">{stats.networkDensity}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Clusters:</span>
                        <span className="font-medium ml-2">{stats.clusters}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* League View Modal */}
        {selectedLeagueModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* League Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">🏈 {selectedLeagueModal.name}</h2>
                    <p className="text-green-100">
                      {selectedLeagueModal.season} • {selectedLeagueModal.total_rosters} teams
                      {selectedLeagueModal.settings && (
                        <span> • {selectedLeagueModal.settings.playoff_teams} playoff spots</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={closeLeagueModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* League Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {leagueModalData.loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    <span className="ml-3 text-lg font-medium">Loading league data...</span>
                  </div>
                ) : leagueModalData.standings.length > 0 ? (
                  <div className="space-y-8">
                    {/* League Standings */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-2xl mr-2">🏆</span>
                        League Standings
                      </h3>
                      
                      <div className="space-y-3">
                        {leagueModalData.standings.map((standing: LeagueStanding) => (
                          <div
                            key={standing.user.userId}
                            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                standing.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {standing.rank}
                              </div>
                              <div className="flex items-center space-x-3">
                                {standing.user.avatar && (
                                  <Image
                                    src={SleeperService.getAvatarURL(standing.user.avatar) || ''}
                                    alt={`${standing.user.displayName} avatar`}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {standing.user.displayName}
                                  </p>
                                  {standing.user.teamName && (
                                    <p className="text-sm text-gray-500">{standing.user.teamName}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{standing.roster.record}</p>
                              <p className="text-sm text-gray-500">{standing.roster.points} pts</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team Rosters */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-2xl mr-2">👥</span>
                        Team Rosters
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {leagueModalData.rosters.map((roster: ProcessedRoster) => {
                          const owner = leagueModalData.users.find((u: ProcessedUser) => u.userId === roster.ownerId);
                          return (
                            <div key={roster.rosterId} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-3 mb-4">
                                {owner?.avatar && (
                                  <Image
                                    src={SleeperService.getAvatarURL(owner.avatar) || ''}
                                    alt={`${owner.displayName} avatar`}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                )}
                                <div>
                                  <h4 className="font-bold text-gray-900">
                                    {owner?.displayName || 'Unknown Owner'}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {roster.record} • {roster.points} pts
                                  </p>
                                </div>
                              </div>

                              {/* Starting Lineup */}
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-700 mb-2">Starters</h5>
                                <div className="space-y-1">
                                  {roster.starters.slice(0, 9).map((playerId, index) => {
                                    const playerName = getPlayerName(playerId);
                                    const position = getPlayerPosition(playerId);
                                    return (
                                      <div key={`${playerId}-${index}`} className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{playerName}</span>
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

                              {/* Bench (first 6 players) */}
                              <div>
                                <h5 className="font-semibold text-gray-700 mb-2">Bench</h5>
                                <div className="space-y-1">
                                  {roster.players
                                    .filter(playerId => !roster.starters.includes(playerId))
                                    .slice(0, 6)
                                    .map((playerId) => {
                                      const playerName = getPlayerName(playerId);
                                      const position = getPlayerPosition(playerId);
                                      return (
                                        <div key={playerId} className="flex items-center justify-between text-sm opacity-75">
                                          <span>{playerName}</span>
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
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏈</div>
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No League Data</h4>
                    <p className="text-gray-500">Unable to load league details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 