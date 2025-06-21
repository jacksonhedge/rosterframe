'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ScrollFade } from './animations/ScrollFade';
import { GoogleSheetsExporter } from '@/app/lib/google-sheets-export';
import { createClient } from '@supabase/supabase-js';

interface ScraperProgress {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentLetter?: number;
  totalLetters?: number;
  letter?: string;
  page?: number;
  totalPages?: number;
  playersScraped?: number;
  summary?: Record<string, number>;
  error?: string;
}

export function FootballPlayerScraper() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ScraperProgress>({ status: 'idle' });
  const [selectedLetters, setSelectedLetters] = useState<string[]>(['A', 'B', 'C', 'D', 'E', 'F']);
  const [saveToDatabase, setSaveToDatabase] = useState(false);

  // Poll for progress updates
  useEffect(() => {
    if (!jobId || progress.status === 'completed' || progress.status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/scraper/football-players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getProgress',
            jobId
          })
        });

        const data = await response.json();
        if (data.progress) {
          setProgress(data.progress);
        }
      } catch (error) {
        console.error('Failed to get progress:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [jobId, progress.status]);

  const handleStartScraping = async () => {
    setProgress({ status: 'running' });
    
    try {
      const response = await fetch('/api/scraper/football-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrapeLetters',
          letters: selectedLetters,
          saveToDatabase
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setJobId(data.jobId);
      } else {
        throw new Error(data.error || 'Failed to start scraping');
      }
    } catch (error) {
      setProgress({ 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const handleLetterToggle = (letter: string) => {
    setSelectedLetters(prev => 
      prev.includes(letter) 
        ? prev.filter(l => l !== letter)
        : [...prev, letter].sort()
    );
  };

  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const letterGroups = [
    { label: 'A-F', letters: ['A', 'B', 'C', 'D', 'E', 'F'] },
    { label: 'G-L', letters: ['G', 'H', 'I', 'J', 'K', 'L'] },
    { label: 'M-R', letters: ['M', 'N', 'O', 'P', 'Q', 'R'] },
    { label: 'S-Z', letters: ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <ScrollFade>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            <span className="gradient-text">Football Player Database Scraper</span>
          </h2>
          <p className="text-[var(--text-secondary)]">
            Scrape player data from FootballDB.com
          </p>
        </div>
      </ScrollFade>

      {/* Letter Selection */}
      <ScrollFade delay={100}>
        <Card className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Select Letters to Scrape</h3>
          
          {/* Quick select groups */}
          <div className="flex flex-wrap gap-2 mb-4">
            {letterGroups.map(group => (
              <Button
                key={group.label}
                variant="secondary"
                size="sm"
                onClick={() => {
                  const allSelected = group.letters.every(l => selectedLetters.includes(l));
                  if (allSelected) {
                    setSelectedLetters(prev => prev.filter(l => !group.letters.includes(l)));
                  } else {
                    setSelectedLetters(prev => [...new Set([...prev, ...group.letters])].sort());
                  }
                }}
              >
                {group.label}
              </Button>
            ))}
          </div>

          {/* Individual letter selection */}
          <div className="grid grid-cols-13 gap-2">
            {allLetters.map(letter => (
              <button
                key={letter}
                onClick={() => handleLetterToggle(letter)}
                className={`
                  p-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all
                  ${selectedLetters.includes(letter)
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]'
                  }
                `}
                disabled={progress.status === 'running'}
              >
                {letter}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-[var(--text-secondary)]">
            Selected: {selectedLetters.length} letters ({selectedLetters.join(', ')})
          </div>
        </Card>
      </ScrollFade>

      {/* Options */}
      <ScrollFade delay={200}>
        <Card className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Options</h3>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saveToDatabase}
              onChange={(e) => setSaveToDatabase(e.target.checked)}
              disabled={progress.status === 'running'}
              className="w-4 h-4 rounded border-[var(--surface-3)] text-[var(--color-primary)]"
            />
            <span className="text-[var(--text-primary)]">
              Save to database after scraping
            </span>
          </label>
        </Card>
      </ScrollFade>

      {/* Control Buttons */}
      <ScrollFade delay={300}>
        <div className="flex gap-4 mb-8">
          <Button
            onClick={handleStartScraping}
            disabled={progress.status === 'running' || selectedLetters.length === 0}
            loading={progress.status === 'running'}
            className="flex-1"
          >
            Start Scraping
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => {
              setProgress({ status: 'idle' });
              setJobId(null);
            }}
            disabled={progress.status !== 'completed' && progress.status !== 'failed'}
          >
            Reset
          </Button>
        </div>
      </ScrollFade>

      {/* Progress Display */}
      {progress.status !== 'idle' && (
        <ScrollFade delay={400}>
          <Card>
            <h3 className="text-xl font-semibold mb-4">Progress</h3>
            
            {/* Status */}
            <div className="mb-4">
              <span className="text-sm text-[var(--text-secondary)]">Status: </span>
              <span className={`font-medium ${
                progress.status === 'completed' ? 'text-[var(--color-success)]' :
                progress.status === 'failed' ? 'text-[var(--color-error)]' :
                'text-[var(--color-primary)]'
              }`}>
                {progress.status.toUpperCase()}
              </span>
            </div>

            {/* Progress details */}
            {progress.status === 'running' && (
              <div className="space-y-2">
                {progress.totalLetters && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Letter Progress</span>
                      <span>{progress.currentLetter || 0} / {progress.totalLetters}</span>
                    </div>
                    <div className="w-full bg-[var(--surface-2)] rounded-full h-2">
                      <div 
                        className="bg-[var(--gradient-primary)] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((progress.currentLetter || 0) / progress.totalLetters) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {progress.letter && progress.totalPages && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current Letter: {progress.letter}</span>
                      <span>Page {progress.page || 1} / {progress.totalPages}</span>
                    </div>
                    <div className="w-full bg-[var(--surface-2)] rounded-full h-2">
                      <div 
                        className="bg-[var(--gradient-accent)] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((progress.page || 1) / progress.totalPages) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-sm text-[var(--text-secondary)] mt-2">
                  Players scraped: {progress.playersScraped || 0}
                </div>
              </div>
            )}

            {/* Summary for completed */}
            {progress.status === 'completed' && progress.summary && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {Object.entries(progress.summary).map(([letter, count]) => (
                  <div key={letter} className="text-center p-3 bg-[var(--surface-1)] rounded-[var(--radius)]">
                    <div className="text-2xl font-bold text-[var(--color-primary)]">{letter}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{count} players</div>
                  </div>
                ))}
                <div className="col-span-3 text-center p-4 bg-[var(--gradient-primary)] text-white rounded-[var(--radius)]">
                  <div className="text-3xl font-bold">
                    {Object.values(progress.summary).reduce((a, b) => a + b, 0)}
                  </div>
                  <div className="text-sm">Total Players Scraped</div>
                </div>
              </div>
            )}

            {/* Error display */}
            {progress.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-[var(--radius)]">
                {progress.error}
              </div>
            )}
          </Card>
        </ScrollFade>
      )}

      {/* Export Options - Only show when completed */}
      {progress.status === 'completed' && progress.summary && (
        <ScrollFade delay={500}>
          <Card className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Export Options</h3>
            
            <div className="space-y-4">
              {/* Export from Supabase */}
              <div>
                <h4 className="font-medium mb-2">Export from Database</h4>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      try {
                        const supabase = createClient(
                          process.env.NEXT_PUBLIC_SUPABASE_URL!,
                          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                        );
                        
                        const { data, error } = await supabase
                          .from('football_players')
                          .select('*')
                          .in('letter', selectedLetters)
                          .order('name');
                        
                        if (error) throw error;
                        
                        if (data && data.length > 0) {
                          const timestamp = new Date().toISOString().split('T')[0];
                          GoogleSheetsExporter.downloadCSV(
                            data.map(player => ({
                              name: player.name,
                              position: player.position,
                              yearsActive: player.years_active,
                              college: player.college,
                              height: player.height,
                              weight: player.weight,
                              birthDate: player.birth_date,
                              profileUrl: player.profile_url
                            })),
                            `football-players-${selectedLetters.join('')}-${timestamp}.csv`
                          );
                        }
                      } catch (error) {
                        console.error('Export error:', error);
                        alert('Failed to export data');
                      }
                    }}
                  >
                    📊 Export to CSV
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const instructions = GoogleSheetsExporter.getImportInstructions();
                      alert(instructions);
                    }}
                  >
                    ❓ How to Import
                  </Button>
                </div>
              </div>

              {/* View in Database */}
              <div>
                <h4 className="font-medium mb-2">View in Supabase</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  Data has been saved to the 'football_players' table
                </p>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => {
                    window.open(
                      `https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0].split('//')[1]}/editor/football_players`,
                      '_blank'
                    );
                  }}
                >
                  🗄️ Open in Supabase
                </Button>
              </div>
            </div>
          </Card>
        </ScrollFade>
      )}
    </div>
  );
}