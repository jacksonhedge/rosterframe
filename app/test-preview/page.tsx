'use client';

import { useEffect, useState } from 'react';

export default function TestPreview() {
  const [savedPreviews, setSavedPreviews] = useState<any[]>([]);
  const [completeLayouts, setCompleteLayouts] = useState<any[]>([]);

  useEffect(() => {
    // Load saved previews
    const previews = JSON.parse(localStorage.getItem('savedPreviews') || '[]');
    setSavedPreviews(previews);

    // Load complete layouts
    const layouts = JSON.parse(localStorage.getItem('completePlaqueLayouts') || '[]');
    setCompleteLayouts(layouts);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Preview Storage</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Saved Previews ({savedPreviews.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedPreviews.map((preview, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold">Preview {index + 1}</h3>
              <p className="text-sm">Type: {preview.plaqueType}</p>
              <p className="text-sm">Style: {preview.plaqueStyle}</p>
              <p className="text-sm">Back View: {preview.isBackView ? 'Yes' : 'No'}</p>
              <p className="text-sm text-gray-600">URL: {preview.imageUrl}</p>
              {preview.imageUrl && (
                <img 
                  src={preview.imageUrl} 
                  alt={`Preview ${index + 1}`}
                  className="mt-2 w-full h-32 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Complete Layouts ({completeLayouts.length})</h2>
        <div className="space-y-4">
          {completeLayouts.map((layout, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold">Layout {index + 1}</h3>
              <p className="text-sm">Type: {layout.plaqueType}</p>
              <p className="text-sm">Style: {layout.plaqueStyle}</p>
              <p className="text-sm">Team: {layout.teamName}</p>
              <p className="text-sm">Cards: {layout.testCards?.length || 0}</p>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(layout, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 space-x-4">
        <button
          onClick={() => {
            const previews = JSON.parse(localStorage.getItem('savedPreviews') || '[]');
            setSavedPreviews(previews);
            const layouts = JSON.parse(localStorage.getItem('completePlaqueLayouts') || '[]');
            setCompleteLayouts(layouts);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
        <button
          onClick={() => {
            if (confirm('Clear all saved previews?')) {
              localStorage.removeItem('savedPreviews');
              setSavedPreviews([]);
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Previews
        </button>
      </div>
    </div>
  );
}