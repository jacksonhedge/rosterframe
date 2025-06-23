'use client';

import { useEffect, useState } from 'react';

export default function SavedPreviewDebug() {
  const [savedPreviews, setSavedPreviews] = useState<any[]>([]);
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    const loadPreviews = () => {
      const previews = JSON.parse(localStorage.getItem('savedPreviews') || '[]');
      setSavedPreviews(previews);
    };

    loadPreviews();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadPreviews();
      setUpdateKey(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check every second
    const interval = setInterval(loadPreviews, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-sm">
      <h3 className="font-bold mb-2">Saved Previews Debug ({updateKey})</h3>
      <div className="space-y-2 text-xs">
        <p>Total saved: {savedPreviews.length}</p>
        {savedPreviews.map((preview, i) => (
          <div key={i} className="border-t pt-2">
            <p>Type: {preview.plaqueType}, Style: {preview.plaqueStyle}</p>
            <p className="text-gray-600 truncate">URL: {preview.imageUrl}</p>
            {preview.imageUrl && (
              <img 
                src={preview.imageUrl} 
                alt="Preview" 
                className="w-20 h-15 object-cover rounded mt-1"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}