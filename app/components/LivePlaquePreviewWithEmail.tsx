'use client';

import { useState } from 'react';
import LivePlaquePreview from './LivePlaquePreview';
import EmailPreviewModal from './EmailPreviewModal';

interface LivePlaquePreviewWithEmailProps {
  teamName: string;
  plaqueStyle: string;
  selectedCards: Record<string, any>;
  rosterPositions: Array<{ id: string; position: string; playerName: string; }>;
  plaqueType: '8' | '10';
  previewImage?: string;
  totalPositions?: number;
}

export default function LivePlaquePreviewWithEmail(props: LivePlaquePreviewWithEmailProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentPreviewImage, setCurrentPreviewImage] = useState<string>('');

  // Count selected cards
  const selectedCount = Object.keys(props.selectedCards).length;
  const canEmail = selectedCount > 0 && currentPreviewImage;

  return (
    <div className="relative">
      <LivePlaquePreview {...props} />
      
      {/* Email Button - positioned at bottom right of preview */}
      {selectedCount > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              // Get the current preview image from the DOM
              const previewImg = document.querySelector('.live-plaque-preview img') as HTMLImageElement;
              if (previewImg && previewImg.src) {
                setCurrentPreviewImage(previewImg.src);
                setShowEmailModal(true);
              } else {
                alert('Please wait for the preview to load before emailing');
              }
            }}
            className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email This Preview
          </button>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && currentPreviewImage && (
        <EmailPreviewModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          previewData={{
            imageUrl: currentPreviewImage,
            teamName: props.teamName || 'Your Team',
            plaqueType: props.plaqueType,
            plaqueStyle: props.plaqueStyle,
          }}
        />
      )}
    </div>
  );
}