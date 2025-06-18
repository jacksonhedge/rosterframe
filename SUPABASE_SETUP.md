# Supabase Setup Guide for Roster Frame

This guide will help you set up Supabase to store and manage fantasy football league data from the Sleeper API.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `roster-frame-db` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Your Supabase Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the entire content from `supabase-schema.sql`
3. Click "Run" to execute the SQL

This will create all necessary tables:
- `leagues` - Basic league information
- `user_teams` - User/team data per league
- `rosters` - Player rosters and season stats
- `league_outcomes` - Championship results and final standings
- `players` - Player information database

## 📊 Database Schema Overview

### Tables Created

| Table | Purpose | Key Data |
|-------|---------|----------|
| `leagues` | League settings and info | League name, season, sport, settings |
| `user_teams` | Users in each league | Username, display name, team name |
| `rosters` | Team rosters and records | Players, starters, wins/losses, points |
| `league_outcomes` | Season results | Champion, runner-up, playoff bracket |
| `players` | Player details | Name, position, team, status |

### Relationships

- `leagues` ← `user_teams` (one-to-many)
- `leagues` ← `rosters` (one-to-many)  
- `leagues` ← `league_outcomes` (one-to-one)
- `user_teams` ← `rosters` (one-to-one)

## 🔧 Features Enabled

### Automatic Data Deduplication
- Leagues won't be saved twice for the same season
- Players are automatically deduplicated by player_id
- User teams are unique per league

### Data Tracking
- **Champions**: Actual tournament winners (not just highest scorer)
- **Complete Rosters**: All players + starting lineups
- **Season Stats**: Wins, losses, total points, etc.
- **Player Details**: Names, positions, teams

### Business Value
- **Mockup Generation**: Build custom frames with real roster data
- **Customer Targeting**: Identify champions and high-performers
- **Product Recommendations**: Suggest cards based on actual rosters
- **Analytics**: Track league trends and popular players

## 🎯 Using the Integration

### Save Individual League
```javascript
// After loading league data in Secret Sleeper
// Click "Save to Database" button in the league view
```

### Check Saved Data
```sql
-- View all saved leagues
SELECT * FROM leagues ORDER BY created_at DESC;

-- View league with full data
SELECT * FROM league_complete_data 
WHERE league_name ILIKE '%your-league-name%';

-- Find champions
SELECT l.league_name, l.season, ut.display_name as champion
FROM leagues l
JOIN league_outcomes lo ON l.league_id = lo.league_id
JOIN user_teams ut ON lo.champion_user_id = ut.user_id
WHERE lo.champion_user_id IS NOT NULL;
```

## 🔒 Security Setup (Optional)

### Row Level Security (RLS)
If you want to restrict data access, uncomment the RLS sections in the schema:

```sql
-- Enable RLS
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
-- Add policies as needed
```

### API Keys
- **Anon Key**: Safe for client-side use (already configured)
- **Service Key**: Keep private, only for server-side operations

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   ```
   Error: supabaseUrl and supabaseAnonKey are required
   ```
   - Check `.env.local` file exists
   - Verify variable names are exact
   - Restart development server after adding variables

2. **Database Connection Errors**
   ```
   Error: Failed to connect to database
   ```
   - Check your Supabase project is active
   - Verify URL and key are correct
   - Check project isn't paused (free tier limitation)

3. **Schema Creation Errors**
   - Make sure to run the entire `supabase-schema.sql` file
   - Check for any SQL syntax errors in the dashboard
   - Verify UUID extension is enabled

4. **Save Functionality Not Working**
   - Ensure you've selected and loaded a league first
   - Check browser console for error messages
   - Verify all required data is loaded before saving

## 📈 Next Steps

1. **Test the Integration**: Load a league and click "Save to Database"
2. **Verify Data**: Check your Supabase dashboard to see saved data
3. **Build Mockups**: Use saved roster data to create custom frame designs
4. **Scale Up**: Save multiple leagues to build your customer database

## 🎉 Success Indicators

When setup is complete, you should be able to:
- ✅ Load any Sleeper league in the Secret Sleeper tool
- ✅ Click "Save to Database" without errors
- ✅ See saved data in your Supabase dashboard
- ✅ Use the data to build custom product mockups

---

**Need Help?** Check the Supabase documentation or create an issue in the project repository. 