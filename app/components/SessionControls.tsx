'use client';

import { sessionManager } from '@/app/lib/session-manager';

export default function SessionControls() {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 flex items-center gap-2">
        <span className="text-xs text-gray-600">Session saved</span>
        <button
          onClick={() => {
            if (confirm('Clear all saved progress and start over?')) {
              sessionManager.clearSession();
              window.location.reload();
            }
          }}
          className="text-xs text-red-600 hover:text-red-700 font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
}