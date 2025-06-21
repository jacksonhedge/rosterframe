'use client';

import { useState } from 'react';

interface ImportResult {
  success: boolean;
  message: string;
  playersImported?: number;
  timestamp?: string;
}

export default function NFLDataImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importNFLData = async () => {
    setIsImporting(true);
    setResult(null);

    try {
      const response = await fetch('/api/nfl-data/import', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token', // Replace with actual auth
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Show success message and refresh any affected components
        console.log(`✅ Successfully imported ${data.playersImported} NFL players`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      setResult({
        success: false,
        message: 'Failed to connect to import service'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const checkDataStatus = async () => {
    try {
      const response = await fetch('/api/nfl-data/import');
      const data = await response.json();
      console.log('NFL Data Import API Status:', data);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">NFL Player Database</h3>
          <p className="text-sm text-slate-600">
            Import authentic NFL player data from 2020-2024 seasons
          </p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            🏈 Official Data
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Data Source Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Data Source</h4>
          <p className="text-sm text-blue-700 mb-2">
            <strong>Repository:</strong> <a 
              href="https://github.com/hvpkod/NFL-Data" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-blue-900"
            >
              hvpkod/NFL-Data
            </a>
          </p>
          <div className="text-xs text-blue-600">
            <p><strong>Seasons:</strong> 2020, 2021, 2022, 2023, 2024</p>
            <p><strong>Positions:</strong> QB, RB, WR, TE, K, DEF</p>
            <p><strong>Format:</strong> Raw Fantasy Football data with stats</p>
          </div>
        </div>

        {/* Import Actions */}
        <div className="flex space-x-3">
          <button
            onClick={importNFLData}
            disabled={isImporting}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isImporting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {isImporting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Importing...</span>
              </div>
            ) : (
              '🏈 Import NFL Data (2020-2024)'
            )}
          </button>

          <button
            onClick={checkDataStatus}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            📊 Check Status
          </button>
        </div>

        {/* Import Result */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start space-x-2">
              <span className="text-lg">
                {result.success ? '✅' : '❌'}
              </span>
              <div className="flex-1">
                <p className="font-medium">
                  {result.success ? 'Import Successful!' : 'Import Failed'}
                </p>
                <p className="text-sm mt-1">{result.message}</p>
                {result.playersImported && (
                  <p className="text-sm mt-1">
                    <strong>{result.playersImported}</strong> players imported from GitHub repository
                  </p>
                )}
                {result.timestamp && (
                  <p className="text-xs mt-2 opacity-75">
                    Completed: {new Date(result.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Import Progress (if importing) */}
        {isImporting && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Import Progress</h4>
            <div className="space-y-2 text-sm text-blue-700">
              <p>📥 Fetching data from GitHub repository...</p>
              <p>🔄 Processing 5 seasons × 6 positions = 30 data files</p>
              <p>💾 Importing players to Supabase database...</p>
              <p>⚡ Updating search indexes...</p>
            </div>
            <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h4 className="font-medium text-amber-800 mb-2">📝 After Import</h4>
          <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
            <li>Player search will include real NFL data from 2020-2024</li>
            <li>Build & Buy roster builder will show authentic players</li>
            <li>Players include stats, teams, and position information</li>
            <li>Search results will prioritize official NFL data over marketplace cards</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 