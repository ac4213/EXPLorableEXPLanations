# High Score API - Quick Setup Guide

This API enables global leaderboards for the EXPLorable EXPLanations games.

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Database in cPanel

1. Login to your cPanel hosting account
2. Navigate to **"MySQL Databases"**
3. Create a new database:
   - **Database name:** `[your_username]_explorable_scores`
   - Click "Create Database"
4. Create a new MySQL user:
   - **Username:** `[your_username]_score_api`
   - **Password:** Generate a strong password (save it!)
   - Click "Create User"
5. Add user to database:
   - Select your database from the dropdown
   - Select your user from the dropdown
   - Check **"ALL PRIVILEGES"**
   - Click "Add"

### Step 2: Run Database Setup Script

1. In cPanel, go to **phpMyAdmin**
2. Select your database from the left sidebar
3. Click the **"SQL"** tab
4. Open the file `/database/setup.sql` from this repository
5. Copy the entire contents and paste into the SQL query box
6. Click **"Go"**
7. Verify that you see:
   - ✅ `games` table created (10 rows)
   - ✅ `high_scores` table created (0 rows)

### Step 3: Configure API

1. Open the file `/api/config.php`
2. Update these three lines with your actual values:
   ```php
   define('DB_NAME', 'your_actual_database_name');
   define('DB_USER', 'your_actual_username');
   define('DB_PASS', 'your_actual_password');
   ```
3. Update the allowed origins with your domain:
   ```php
   define('ALLOWED_ORIGINS', [
       'https://yourdomain.com',
       'https://www.yourdomain.com'
   ]);
   ```
4. Save the file

### Step 4: Upload to cPanel

Upload these files to your cPanel hosting:

```
/public_html/
├── api/
│   ├── config.php           (MODIFIED - your credentials)
│   ├── database.php
│   ├── submit_score.php
│   ├── get_leaderboard.php
│   └── .htaccess
└── Games/
    └── shared/
        └── highscore-api.js
```

You can upload via:
- **cPanel File Manager** (easiest)
- **FTP client** (FileZilla, etc.)
- **Git** (if available)

### Step 5: Test the API

Open your browser console (F12) and run:

```javascript
// Test submit score
fetch('https://yourdomain.com/api/submit_score.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    game_slug: 'flappybork',
    player_name: 'TestPlayer',
    score: 42
  })
}).then(r => r.json()).then(console.log);

// Test get leaderboard
fetch('https://yourdomain.com/api/get_leaderboard.php?game_slug=flappybork')
  .then(r => r.json())
  .then(console.log);
```

Expected response:
```json
{
  "success": true,
  "score_id": 1,
  "rank": 1,
  "message": "Score submitted successfully"
}
```

## ✅ Done!

Your high-score system is now live! FlappyBork will automatically:
- Submit scores to the global leaderboard
- Display the leaderboard when players press "L"
- Fall back to localStorage if the API is unavailable

## 🎮 How Players Use It

1. **Play the game** - FlappyBork works exactly as before
2. **Get a high score** - On game over, they'll be prompted for their name
3. **View leaderboard** - Press "L" key anytime to see the top 10
4. **Compete globally** - Scores are shared across all players worldwide

## 📊 Available Games

The database includes these games (ready for integration):
- ✅ Flappy Bork (integrated)
- Snake
- Tetris
- Pong
- Asteroids
- Match3
- Borkout
- WordQuest BIO
- WordQuest ENG
- Parabolic

## 🔧 Troubleshooting

### "Database connection failed"
- Check that `config.php` has the correct database name, username, and password
- Verify the database exists in cPanel > MySQL Databases
- Check that the user has ALL PRIVILEGES on the database

### "CORS error in browser console"
- Update `ALLOWED_ORIGINS` in `config.php` with your exact domain
- Make sure to include both `https://yourdomain.com` and `https://www.yourdomain.com`
- Clear browser cache and try again

### "Score not appearing in leaderboard"
- Check the browser console for error messages
- Verify the API test (Step 5) works correctly
- Check if the score was flagged (too high) in phpMyAdmin

### "API not found (404 error)"
- Verify files are uploaded to the correct directory
- Check that `/api/submit_score.php` is accessible
- Ensure the path in `highscore-api.js` matches your setup

## 🛡️ Security & Content Features

### Security
- ✅ SQL injection protection (PDO prepared statements)
- ✅ Rate limiting (10 submissions per IP per hour)
- ✅ Input validation (player names, scores)
- ✅ Anti-cheat detection (flags suspicious scores)
- ✅ CORS protection (only allowed domains)
- ✅ XSS protection (sanitized output)

### Content Moderation
- ✅ **Profanity filter** - Blocks vulgar and inappropriate language
- ✅ **Racist term filter** - Blocks discriminatory content
- ✅ **Sexual content filter** - Blocks explicit content
- ✅ **Leetspeak detection** - Catches variations (a$$, sh!t, etc.)
- ✅ **Separator bypassing** - Catches f.u.c.k, s-h-i-t patterns
- ✅ **Auto-sanitization** - Replaces inappropriate words with asterisks
- ✅ **Smart rejection** - Rejects names that are mostly censored

### Fun Features
- 🎉 **Random Anonymous Names** - Instead of "Anonymous", players get fun alliterative names
- 🐾 Examples: "Opulent Ocelot", "Fantastic Fox", "Brave Badger", "Dazzling Dragonfly"
- 🎲 2860+ unique combinations - virtually infinite variety
- 🔄 Generated fresh each time - supports multiple players on same device
- 🌟 Makes anonymous submissions more engaging and friendly

## 📈 Next Steps

1. **Add SSL certificate** (free Let's Encrypt via cPanel)
2. **Enable HTTPS redirect** (uncomment in `/api/.htaccess`)
3. **Integrate more games** (see `/docs/HIGHSCORE_DATABASE_IMPLEMENTATION.md`)
4. **Monitor scores** (check phpMyAdmin for flagged entries)
5. **Set up automatic backups** (cPanel > Backup Wizard)

## 📚 Full Documentation

For complete implementation details, see:
`/docs/HIGHSCORE_DATABASE_IMPLEMENTATION.md`

## 🆘 Need Help?

If you encounter issues, check:
1. Error logs: `/api/error.log` (via cPanel File Manager)
2. Browser console (F12)
3. phpMyAdmin SQL query results
4. cPanel error logs

---

**Created:** November 2025
**Version:** 1.0
**License:** GNU General Public License
