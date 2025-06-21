'use client';

export default function DebugSave() {
  const checkSavedLayouts = () => {
    const layouts = localStorage.getItem('completePlaqueLayouts');
    if (layouts) {
      const parsed = JSON.parse(layouts);
      console.log('Saved Layouts:', parsed);
      return parsed;
    }
    return null;
  };

  const clearLayouts = () => {
    localStorage.removeItem('completePlaqueLayouts');
    alert('Cleared all saved layouts');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50">
      <h3 className="font-bold mb-2">Debug Save System</h3>
      <div className="space-y-2">
        <button
          onClick={() => {
            const layouts = checkSavedLayouts();
            if (layouts) {
              alert(`Found ${layouts.length} saved layouts:\n${JSON.stringify(layouts, null, 2)}`);
            } else {
              alert('No saved layouts found');
            }
          }}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Check Saved Layouts
        </button>
        <button
          onClick={clearLayouts}
          className="w-full px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear All Layouts
        </button>
        <button
          onClick={() => {
            console.log('localStorage keys:', Object.keys(localStorage));
            alert(`localStorage keys:\n${Object.keys(localStorage).join('\n')}`);
          }}
          className="w-full px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Show All Storage Keys
        </button>
      </div>
    </div>
  );
}