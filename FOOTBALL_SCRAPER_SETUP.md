# Football Player Scraper - Supabase & Google Sheets Setup

## 🚀 Quick Start

### 1. Set Up Supabase Table

First, run this SQL in your Supabase SQL editor:

```sql
-- Copy and paste the contents of create-football-players-table.sql
```

Or run via Supabase CLI:
```bash
supabase db reset
supabase db push create-football-players-table.sql
```

### 2. Update Environment Variables

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Start Scraping

#### Option A: Web Interface
1. Go to http://localhost:3000/admin/scraper
2. Select letters A-F (or any combination)
3. Check "Save to database"
4. Click "Start Scraping"
5. Wait for completion (~10-15 minutes for A-F)

#### Option B: API
```bash
curl -X POST http://localhost:3000/api/scraper/football-players \
  -H "Content-Type: application/json" \
  -d '{
    "action": "scrapeLetters",
    "letters": ["A","B","C","D","E","F"],
    "saveToDatabase": true
  }'
```

## 📊 Export to Google Sheets

### Method 1: Web Interface
After scraping completes:
1. Click "Export to CSV" button
2. Open Google Sheets
3. File > Import > Upload the CSV file
4. Choose comma separator
5. Import!

### Method 2: Direct API Export
```bash
# Export letters A-F as CSV
curl "http://localhost:3000/api/football-players/export?letters=A,B,C,D,E,F&format=csv" \
  -o football-players.csv

# Export as JSON
curl "http://localhost:3000/api/football-players/export?letters=A,B,C,D,E,F&format=json" \
  -o football-players.json
```

### Method 3: From Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to Table Editor > football_players
3. Click Export > Download as CSV

## 📈 View Data in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Table Editor
4. Select `football_players` table

You'll see all scraped players with:
- Name, Position, Years Active
- Auto-generated letter column
- Timestamps
- Total count

## 🔍 Query Examples

### Get Player Count by Letter
```sql
SELECT letter, COUNT(*) as player_count
FROM football_players
GROUP BY letter
ORDER BY letter;
```

### Get All Quarterbacks
```sql
SELECT name, years_active
FROM football_players
WHERE position = 'QB'
ORDER BY name;
```

### Get Players by Position
```sql
SELECT position, COUNT(*) as count
FROM football_players
WHERE position IS NOT NULL
GROUP BY position
ORDER BY count DESC;
```

## 🛠️ Troubleshooting

### "Permission denied" error
- Make sure you're using the service role key for scraping
- Check RLS policies are correctly set

### Scraping is slow
- Normal behavior - respects rate limits
- A-F takes ~10-15 minutes
- Full A-Z takes ~45-60 minutes

### Export not working
- Check Supabase connection
- Verify data exists in table
- Check browser console for errors

## 📱 Google Sheets Tips

### Create a Dashboard
1. Import your CSV data
2. Insert > Chart
3. Select data range
4. Choose chart type:
   - Pie chart for positions
   - Column chart for letters
   - Timeline for years active

### Auto-refresh with Google Apps Script
```javascript
function importFootballData() {
  const url = 'YOUR_API_URL/api/football-players/export?format=csv';
  const response = UrlFetchApp.fetch(url);
  const csvData = response.getContentText();
  
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  
  const data = Utilities.parseCsv(csvData);
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
}

// Run daily
function setupTrigger() {
  ScriptApp.newTrigger('importFootballData')
    .timeBased()
    .everyDays(1)
    .create();
}
```

## 🎯 Next Steps

1. **Schedule Regular Updates**: Set up a cron job to update player data weekly
2. **Add More Details**: Extend scraper to get player stats, images
3. **Build Analytics**: Create dashboard showing player trends
4. **API Integration**: Build endpoints for your app to use this data

---

The football player data is now ready to use in your Roster Frame app!