// Session management for build-and-buy page
// Automatically saves and restores user progress

export interface BuildSession {
  // Basic info
  teamName: string;
  selectedSport: 'NFL' | 'MLB' | 'NBA' | 'NHL';
  currentStep: string;
  
  // Plaque selection
  selectedPlaque: {
    id: string;
    name: string;
    material: string;
    style: string;
    price: number;
  } | null;
  
  // Roster configuration
  rosterPositions: Array<{
    id: string;
    position: string;
    playerName: string;
  }>;
  
  // Card selections
  selectedCards: Record<string, any>;
  
  // Metadata
  lastUpdated: string;
  sessionId: string;
}

class SessionManager {
  private readonly STORAGE_KEY = 'rosterframe_build_session';
  private readonly SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private saveTimeout: NodeJS.Timeout | null = null;

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current session
  getSession(): BuildSession | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored) as BuildSession;
      
      // Check if session is expired
      const lastUpdated = new Date(session.lastUpdated).getTime();
      if (Date.now() - lastUpdated > this.SESSION_EXPIRY) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  // Save session (debounced)
  saveSession(data: Partial<BuildSession>): void {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Debounce saves to avoid excessive localStorage writes
    this.saveTimeout = setTimeout(() => {
      try {
        const existing = this.getSession();
        const session: BuildSession = {
          ...existing,
          ...data,
          lastUpdated: new Date().toISOString(),
          sessionId: existing?.sessionId || this.generateSessionId()
        } as BuildSession;

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        
        // Dispatch event for other tabs/windows
        window.dispatchEvent(new Event('session-updated'));
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }, 500); // Wait 500ms before saving
  }

  // Clear session
  clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new Event('session-cleared'));
  }

  // Check if there's a recoverable session
  hasSession(): boolean {
    const session = this.getSession();
    return session !== null && session.currentStep !== 'done';
  }

  // Listen for session changes (for multi-tab sync)
  onSessionChange(callback: (session: BuildSession | null) => void): () => void {
    const handleChange = () => {
      callback(this.getSession());
    };

    window.addEventListener('session-updated', handleChange);
    window.addEventListener('session-cleared', handleChange);
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        handleChange();
      }
    });

    // Return cleanup function
    return () => {
      window.removeEventListener('session-updated', handleChange);
      window.removeEventListener('session-cleared', handleChange);
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();