/**
 * Google Sheets Export Utility
 * 
 * This creates a CSV format that can be easily imported into Google Sheets
 * For direct API integration, you would need Google Sheets API credentials
 */

interface PlayerData {
  name: string;
  position?: string;
  yearsActive?: string;
  college?: string;
  height?: string;
  weight?: string;
  birthDate?: string;
  profileUrl?: string;
}

export class GoogleSheetsExporter {
  /**
   * Convert players data to CSV format
   */
  static toCSV(players: PlayerData[]): string {
    // Define headers
    const headers = [
      'Name',
      'Position',
      'Years Active',
      'College',
      'Height',
      'Weight',
      'Birth Date',
      'Profile URL',
      'Letter',
      'Scraped Date'
    ];

    // Create CSV rows
    const rows = players.map(player => {
      const letter = player.name ? player.name.charAt(0).toUpperCase() : '';
      const scrapedDate = new Date().toISOString().split('T')[0];
      
      return [
        this.escapeCSV(player.name),
        this.escapeCSV(player.position || ''),
        this.escapeCSV(player.yearsActive || ''),
        this.escapeCSV(player.college || ''),
        this.escapeCSV(player.height || ''),
        this.escapeCSV(player.weight || ''),
        this.escapeCSV(player.birthDate || ''),
        this.escapeCSV(player.profileUrl || ''),
        letter,
        scrapedDate
      ].join(',');
    });

    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Escape CSV values
   */
  private static escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Create a downloadable CSV file
   */
  static downloadCSV(players: PlayerData[], filename: string = 'football-players.csv') {
    const csv = this.toCSV(players);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Generate Google Sheets import instructions
   */
  static getImportInstructions(): string {
    return `
How to Import to Google Sheets:

1. Click "Export to CSV" to download the file
2. Open Google Sheets (sheets.google.com)
3. Create a new spreadsheet or open an existing one
4. Go to File > Import
5. Choose "Upload" and select the CSV file
6. Import settings:
   - Import location: "Replace current sheet" or "Insert new sheet"
   - Separator type: "Comma"
   - Convert text to numbers: Yes
7. Click "Import data"

The data will be imported with proper formatting and you can then:
- Sort by any column
- Filter by position, years, etc.
- Create charts and analytics
- Share with others
`;
  }

  /**
   * Create a shareable Google Sheets URL template
   */
  static createGoogleSheetsURL(csvContent: string): string {
    // This creates a URL that will open Google Sheets with the data
    // Note: There's a URL length limit, so this works best for smaller datasets
    const encodedCSV = encodeURIComponent(csvContent);
    return `https://docs.google.com/spreadsheets/d/create?title=Football+Players+Data&csv=${encodedCSV}`;
  }
}

// Export function to fetch from Supabase and export
export async function exportPlayersFromSupabase(
  supabase: any,
  filters?: {
    letters?: string[];
    position?: string;
  }
): Promise<{ csv: string; count: number }> {
  let query = supabase
    .from('football_players')
    .select('*')
    .order('name', { ascending: true });

  // Apply filters
  if (filters?.letters && filters.letters.length > 0) {
    query = query.in('letter', filters.letters);
  }
  
  if (filters?.position) {
    query = query.eq('position', filters.position);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const csv = GoogleSheetsExporter.toCSV(data || []);
  return { csv, count: data?.length || 0 };
}