'use client';

import { useState } from 'react';
import { previewMaker, type PlaqueConfiguration, type CompiledPreview } from '../lib/preview-maker';

interface CardOption {
  id: string;
  playerName: string;
  name: string;
  year: number;
  brand: string;
  series: string;
  condition: string;
  price: number;
  rarity: 'common' | 'rare' | 'legendary';
  imageUrl: string;
  seller?: string;
  shipping?: number;
  listingUrl?: string;
}

interface PreviewGeneratorProps {
  teamName: string;
  plaqueType: '8' | '10';
  plaqueStyle: string;
  selectedCards: Record<string, CardOption>;
  rosterPositions: Array<{ id: string; position: string; playerName: string }>;
  customerEmail?: string;
  onPreviewGenerated?: (preview: CompiledPreview) => void;
}

export default function PreviewGenerator({
  teamName,
  plaqueType,
  plaqueStyle,
  selectedCards,
  rosterPositions,
  customerEmail,
  onPreviewGenerated
}: PreviewGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<CompiledPreview | null>(null);
  const [emailAddress, setEmailAddress] = useState(customerEmail || '');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Convert selected cards to the format expected by preview maker
  const convertToPlayerCards = () => {
    return rosterPositions
      .filter(pos => selectedCards[pos.id])
      .map(pos => {
        const card = selectedCards[pos.id];
        return {
          id: card.id,
          playerName: card.playerName,
          position: pos.position,
          year: card.year,
          brand: card.brand,
          series: card.series,
          imageUrl: card.imageUrl,
          rarity: card.rarity,
          price: card.price,
          shipping: card.shipping || 0,
        };
      });
  };

  const generatePreview = async () => {
    if (!teamName.trim()) {
      setStatus({ type: 'error', message: 'Team name is required' });
      return;
    }

    const playerCards = convertToPlayerCards();
    if (playerCards.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one player card' });
      return;
    }

    setIsGenerating(true);
    setStatus({ type: 'info', message: 'Generating your custom plaque preview...' });

    try {
      const config: PlaqueConfiguration = {
        plaqueType,
        plaqueStyle,
        teamName,
        playerCards,
        customerEmail: emailAddress || undefined,
      };

      const preview = await previewMaker.generatePreview(config);
      setGeneratedPreview(preview);
      setStatus({ 
        type: 'success', 
        message: 'Preview generated successfully! You can now download or email it.' 
      });

      if (onPreviewGenerated) {
        onPreviewGenerated(preview);
      }

    } catch (error) {
      console.error('Error generating preview:', error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to generate preview. Please try again.' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!generatedPreview) {
      setStatus({ type: 'error', message: 'Please generate a preview first' });
      return;
    }

    if (!emailAddress.trim()) {
      setStatus({ type: 'error', message: 'Please enter an email address' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      setStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setIsSendingEmail(true);
    setStatus({ type: 'info', message: 'Sending preview to your email...' });

    try {
      const success = await previewMaker.emailPreview(
        generatedPreview.previewId,
        emailAddress,
        teamName
      );

      if (success) {
        setStatus({ 
          type: 'success', 
          message: `Preview sent successfully to ${emailAddress}!` 
        });
      } else {
        setStatus({ 
          type: 'error', 
          message: 'Failed to send email. Please try again.' 
        });
      }

    } catch (error) {
      console.error('Error sending email:', error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to send email. Please check your email address and try again.' 
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const downloadPreview = () => {
    if (!generatedPreview) {
      setStatus({ type: 'error', message: 'Please generate a preview first' });
      return;
    }

    // Open download link in new tab
    window.open(generatedPreview.downloadUrl, '_blank');
  };

  const canGenerate = teamName.trim() && convertToPlayerCards().length > 0;
  const playerCards = convertToPlayerCards();

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-amber-900 mb-2">
          🖼️ Generate Final Preview
        </h3>
        <p className="text-amber-700">
          Create a high-quality image of your custom plaque to download or share
        </p>
      </div>

      {/* Status Message */}
      {status.message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          status.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {status.type === 'success' ? '✅' : 
               status.type === 'error' ? '❌' : '🔄'}
            </span>
            <span className="font-medium">{status.message}</span>
          </div>
        </div>
      )}

      {/* Preview Summary */}
      <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
        <h4 className="font-bold text-amber-900 mb-3">Preview Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Team Name:</span>
            <div className="text-amber-800">{teamName || 'Not set'}</div>
          </div>
          <div>
            <span className="font-semibold">Plaque Type:</span>
            <div className="text-amber-800">{plaqueType}-spot {plaqueStyle}</div>
          </div>
          <div>
            <span className="font-semibold">Players Selected:</span>
            <div className="text-amber-800">{playerCards.length} of {plaqueType}</div>
          </div>
          <div>
            <span className="font-semibold">Total Value:</span>
            <div className="text-amber-800">
              ${playerCards.reduce((sum, card) => sum + card.price + (card.shipping || 0), 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Preview Button */}
      <div className="space-y-4">
        <button
          onClick={generatePreview}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg ${
            canGenerate && !isGenerating
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Generating Preview...</span>
            </div>
          ) : (
            '🎨 Generate High-Quality Preview'
          )}
        </button>

        {!canGenerate && (
          <p className="text-center text-sm text-gray-500">
            {!teamName.trim() ? 'Please enter a team name' : 'Please select player cards to generate preview'}
          </p>
        )}
      </div>

      {/* Preview Generated Actions */}
      {generatedPreview && (
        <div className="mt-6 space-y-4">
          <div className="border-t border-amber-200 pt-6">
            <h4 className="font-bold text-amber-900 mb-4">📤 Share Your Preview</h4>
            
            {/* Email Input */}
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address (optional)
              </label>
              <input
                type="email"
                id="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Enter email to send preview"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <button
                onClick={downloadPreview}
                className="flex items-center justify-center space-x-2 bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-amber-700 transition-all"
              >
                <span>📥</span>
                <span>Download Image</span>
              </button>

              <button
                onClick={sendEmail}
                disabled={!emailAddress.trim() || isSendingEmail}
                className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold transition-all ${
                  emailAddress.trim() && !isSendingEmail
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSendingEmail ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    <span>Email Preview</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Display */}
          <div className="border-t border-amber-200 pt-6">
            <h4 className="font-bold text-amber-900 mb-4">🖼️ Your Generated Preview</h4>
            <div className="text-center">
              {generatedPreview.htmlUrl ? (
                <iframe
                  src={generatedPreview.htmlUrl}
                  title="Generated plaque preview"
                  className="w-full rounded-lg shadow-lg border border-gray-200"
                  style={{ height: '400px', border: 'none' }}
                />
              ) : (
                <img
                  src={generatedPreview.imageUrl}
                  alt="Generated plaque preview"
                  className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
                />
              )}
              <p className="text-sm text-gray-600 mt-2">
                Generated on {new Date(generatedPreview.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 