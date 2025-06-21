'use client';

import { useState, useRef } from 'react';

export default function CardScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [cardBackImage, setCardBackImage] = useState<string | null>(null);
  const [scanningMode, setScanningMode] = useState<'front' | 'back'>('front');
  const [formData, setFormData] = useState({
    playerName: '',
    team: '',
    position: '',
    year: new Date().getFullYear(),
    brand: '',
    cardNumber: '',
    series: '',
    rookieCard: null as boolean | null,
    priceMin: 0,
    priceMax: 0,
    condition: '',
    notes: '',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (mode: 'front' | 'back' = 'front') => {
    try {
      setScanningMode(mode);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (error) {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      if (scanningMode === 'front') {
        setCardImage(imageDataUrl);
      } else {
        setCardBackImage(imageDataUrl);
      }
      stopCamera();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCardImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cardData = {
      ...formData,
      cardFrontImageUrl: cardImage,
      cardBackImageUrl: cardBackImage,
      estimatedPriceMin: formData.priceMin,
      estimatedPriceMax: formData.priceMax,
    };

    try {
      const response = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });

      if (response.ok) {
        alert('Card added successfully!');
        // Reset form
        setFormData({
          playerName: '',
          team: '',
          position: '',
          year: new Date().getFullYear(),
          brand: '',
          cardNumber: '',
          series: '',
          rookieCard: null,
          priceMin: 0,
          priceMax: 0,
          condition: '',
          notes: '',
        });
        setCardImage(null);
        setCardBackImage(null);
      } else {
        throw new Error('Failed to add card');
      }
    } catch (error) {
      alert('Error adding card to inventory');
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Camera Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">📱 Card Scanner</h2>
          
          {!isScanning && !cardImage && (
            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-6">
                Start Scanning Cards
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => startCamera('front')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                  >
                    📱 Scan Card Front
                  </button>
                  <button
                    onClick={() => startCamera('back')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
                  >
                    📱 Scan Card Back
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700"
                >
                  📁 Upload Image
                </button>
              </div>
            </div>
          )}

          {/* Camera View */}
          {isScanning && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <span className={`inline-block px-4 py-2 rounded-lg font-medium ${
                  scanningMode === 'front' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  Scanning: Card {scanningMode === 'front' ? 'Front' : 'Back'}
                </span>
              </div>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={captureImage}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
                >
                  📸 Capture Card {scanningMode === 'front' ? 'Front' : 'Back'}
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}

          {/* Captured Images */}
          {(cardImage || cardBackImage) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Captured Images</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card Front */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">Card Front</span>
                    {!cardImage && (
                      <button
                        onClick={() => startCamera('front')}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        📱 Scan Front
                      </button>
                    )}
                  </div>
                  <div className="relative bg-slate-100 rounded-lg aspect-[2.5/3.5] flex items-center justify-center">
                    {cardImage ? (
                      <>
                        <img
                          src={cardImage}
                          alt="Card front"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setCardImage(null)}
                          className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-500">
                        <div className="text-2xl mb-1">📄</div>
                        <div className="text-xs">No front image</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Back */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-800">Card Back</span>
                    {!cardBackImage && (
                      <button
                        onClick={() => startCamera('back')}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                      >
                        📱 Scan Back
                      </button>
                    )}
                  </div>
                  <div className="relative bg-slate-100 rounded-lg aspect-[2.5/3.5] flex items-center justify-center">
                    {cardBackImage ? (
                      <>
                        <img
                          src={cardBackImage}
                          alt="Card back"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setCardBackImage(null)}
                          className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-slate-500">
                        <div className="text-2xl mb-1">📄</div>
                        <div className="text-xs">No back image</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">📝 Card Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Player Name *
              </label>
              <input
                type="text"
                value={formData.playerName}
                onChange={(e) => setFormData(prev => ({ ...prev, playerName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Team
                </label>
                <select
                  value={formData.team}
                  onChange={(e) => setFormData(prev => ({ ...prev, team: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Team</option>
                  <option value="Arizona Cardinals">Arizona Cardinals</option>
                  <option value="Atlanta Falcons">Atlanta Falcons</option>
                  <option value="Baltimore Ravens">Baltimore Ravens</option>
                  <option value="Buffalo Bills">Buffalo Bills</option>
                  <option value="Carolina Panthers">Carolina Panthers</option>
                  <option value="Chicago Bears">Chicago Bears</option>
                  <option value="Cincinnati Bengals">Cincinnati Bengals</option>
                  <option value="Cleveland Browns">Cleveland Browns</option>
                  <option value="Dallas Cowboys">Dallas Cowboys</option>
                  <option value="Denver Broncos">Denver Broncos</option>
                  <option value="Detroit Lions">Detroit Lions</option>
                  <option value="Green Bay Packers">Green Bay Packers</option>
                  <option value="Houston Texans">Houston Texans</option>
                  <option value="Indianapolis Colts">Indianapolis Colts</option>
                  <option value="Jacksonville Jaguars">Jacksonville Jaguars</option>
                  <option value="Kansas City Chiefs">Kansas City Chiefs</option>
                  <option value="Las Vegas Raiders">Las Vegas Raiders</option>
                  <option value="Los Angeles Chargers">Los Angeles Chargers</option>
                  <option value="Los Angeles Rams">Los Angeles Rams</option>
                  <option value="Miami Dolphins">Miami Dolphins</option>
                  <option value="Minnesota Vikings">Minnesota Vikings</option>
                  <option value="New England Patriots">New England Patriots</option>
                  <option value="New Orleans Saints">New Orleans Saints</option>
                  <option value="New York Giants">New York Giants</option>
                  <option value="New York Jets">New York Jets</option>
                  <option value="Philadelphia Eagles">Philadelphia Eagles</option>
                  <option value="Pittsburgh Steelers">Pittsburgh Steelers</option>
                  <option value="San Francisco 49ers">San Francisco 49ers</option>
                  <option value="Seattle Seahawks">Seattle Seahawks</option>
                  <option value="Tampa Bay Buccaneers">Tampa Bay Buccaneers</option>
                  <option value="Tennessee Titans">Tennessee Titans</option>
                  <option value="Washington Commanders">Washington Commanders</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Position</option>
                  <option value="QB">QB - Quarterback</option>
                  <option value="RB">RB - Running Back</option>
                  <option value="WR">WR - Wide Receiver</option>
                  <option value="TE">TE - Tight End</option>
                  <option value="K">K - Kicker</option>
                  <option value="DEF">DEF - Defense</option>
                  <option value="OL">OL - Offensive Line</option>
                  <option value="DL">DL - Defensive Line</option>
                  <option value="LB">LB - Linebacker</option>
                  <option value="DB">DB - Defensive Back</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Brand *
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Brand</option>
                  <option value="Panini">Panini</option>
                  <option value="Topps">Topps</option>
                  <option value="Topps Chrome">Topps Chrome</option>
                  <option value="Upper Deck">Upper Deck</option>
                  <option value="Bowman">Bowman</option>
                  <option value="Bowman Chrome">Bowman Chrome</option>
                  <option value="Donruss">Donruss</option>
                  <option value="Fleer">Fleer</option>
                  <option value="Score">Score</option>
                  <option value="Leaf">Leaf</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. #123"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rookie Card
                </label>
                <select
                  value={formData.rookieCard === null ? '' : formData.rookieCard.toString()}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : e.target.value === 'true';
                    setFormData(prev => ({ ...prev, rookieCard: value }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unknown</option>
                  <option value="true">Yes - Rookie Card</option>
                  <option value="false">No - Not Rookie</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Series/Set
              </label>
              <input
                type="text"
                value={formData.series}
                onChange={(e) => setFormData(prev => ({ ...prev, series: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Base Set, Prizm, Select"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Price Range Min ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceMin}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceMin: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Price Range Max ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.priceMax}
                  onChange={(e) => setFormData(prev => ({ ...prev, priceMax: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Condition</option>
                <option value="Mint">Mint (10)</option>
                <option value="Near Mint">Near Mint (9)</option>
                <option value="Excellent">Excellent (8)</option>
                <option value="Very Good">Very Good (7)</option>
                <option value="Good">Good (6)</option>
                <option value="Fair">Fair (5)</option>
                <option value="Poor">Poor (1-4)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Any additional notes about the card..."
              />
            </div>

            <button
              type="submit"
              disabled={!formData.playerName.trim()}
              className={`w-full py-3 text-lg font-bold rounded-xl transition-all ${
                !formData.playerName.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg'
              }`}
            >
              💾 Add Card to Inventory
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 