// Auto email service for sending preview updates

export class AutoEmailService {
  private userEmail: string | null = null;
  private lastSentConfig: string = '';
  private sendTimeout: NodeJS.Timeout | null = null;
  
  constructor() {
    // Check if user has saved email (only on client side)
    if (typeof window !== 'undefined') {
      this.userEmail = localStorage.getItem('rosterframe_user_email');
    }
  }

  setEmail(email: string) {
    this.userEmail = email;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rosterframe_user_email', email);
    }
  }

  clearEmail() {
    this.userEmail = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rosterframe_user_email');
    }
  }

  hasEmail(): boolean {
    return !!this.userEmail;
  }

  // Send preview update (debounced)
  async sendPreviewUpdate(config: {
    teamName: string;
    plaqueType: string;
    plaqueStyle: string;
    previewUrl: string;
    playerCount: number;
    step: string;
  }) {
    if (!this.userEmail) return;

    // Create config string to check if changed
    const configString = JSON.stringify(config);
    if (configString === this.lastSentConfig) return;

    // Clear existing timeout
    if (this.sendTimeout) {
      clearTimeout(this.sendTimeout);
    }

    // Debounce emails - wait 10 seconds after changes stop
    this.sendTimeout = setTimeout(async () => {
      try {
        const response = await fetch('/api/email-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: this.userEmail,
            recipientName: 'Plaque Builder',
            teamName: config.teamName,
            previewUrl: config.previewUrl,
            plaqueType: config.plaqueType,
            plaqueStyle: config.plaqueStyle,
            message: this.getProgressMessage(config),
            senderName: 'RosterFrame Auto-Save'
          }),
        });

        if (response.ok) {
          this.lastSentConfig = configString;
          console.log('Preview update sent to', this.userEmail);
        }
      } catch (error) {
        console.error('Failed to send preview update:', error);
      }
    }, 10000); // Wait 10 seconds
  }

  private getProgressMessage(config: any): string {
    const messages = {
      'setup': `Great start! You've selected a ${config.plaqueStyle} plaque for ${config.teamName}.`,
      'building': `Nice progress! You've added ${config.playerCount} players to your roster.`,
      'cards': `Looking good! You're selecting cards for your ${config.playerCount} players.`,
      'purchase': `Almost done! Your ${config.teamName} plaque is ready for checkout.`
    };

    return messages[config.step as keyof typeof messages] || 'Your plaque is coming together nicely!';
  }
}

// Export singleton
export const autoEmailService = new AutoEmailService();