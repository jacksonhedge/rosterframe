'use client';

import { useState } from 'react';

export default function TestHtmlPreview() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTestPreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const testConfig = {
        plaqueType: '8',
        plaqueStyle: 'dark-maple-wood',
        teamName: 'Test Team HTML',
        playerCards: [
          {
            id: '1',
            playerName: 'Player One',
            position: 'Forward',
            year: 2023,
            brand: 'Test Brand',
            series: 'Test Series',
            imageUrl: '/images/placeholder-card.png',
            rarity: 'legendary',
            price: 99.99,
            shipping: 5.00
          },
          {
            id: '2',
            playerName: 'Player Two',
            position: 'Guard',
            year: 2023,
            brand: 'Test Brand',
            series: 'Test Series',
            imageUrl: '',
            rarity: 'rare',
            price: 49.99,
            shipping: 5.00
          }
        ],
        showCardBacks: false
      };

      const response = await fetch('/api/preview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testConfig),
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Preview result:', result);
      
      setPreviewUrl(result.htmlUrl || result.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test HTML Preview Generation</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate Test Preview</h2>
          
          <button
            onClick={generateTestPreview}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate HTML Preview'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>
        
        {previewUrl && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Preview</h2>
            
            {previewUrl.endsWith('.html') ? (
              <div>
                <p className="mb-4 text-gray-600">HTML Preview:</p>
                <iframe
                  src={previewUrl}
                  title="HTML Preview"
                  className="w-full border border-gray-300"
                  style={{ height: '600px' }}
                />
                <div className="mt-4">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mr-4"
                  >
                    Open in new tab
                  </a>
                  <a
                    href={previewUrl}
                    download
                    className="text-blue-500 hover:underline"
                  >
                    Download HTML
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-gray-600">Image Preview:</p>
                <img
                  src={previewUrl}
                  alt="Generated preview"
                  className="max-w-full h-auto border border-gray-300"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}