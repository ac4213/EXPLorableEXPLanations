# High-Score Database Implementation Guide
## For cPanel-Hosted EXPLorable EXPLanations Games

**Version:** 1.0
**Date:** November 2025
**Project:** Explorable Explanations for Engineering

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [cPanel Resources Available](#cpanel-resources-available)
4. [Quick Wins & Implementation Strategy](#quick-wins--implementation-strategy)
5. [Database Schema Design](#database-schema-design)
6. [Backend API Implementation](#backend-api-implementation)
7. [Frontend Integration](#frontend-integration)
8. [Security Considerations](#security-considerations)
9. [Deployment Checklist](#deployment-checklist)
10. [Maintenance & Monitoring](#maintenance--monitoring)

---

## Executive Summary

This document outlines a practical, cPanel-friendly approach to add centralized high-score tracking across all 11 games in the EXPLorable EXPLanations project. The solution leverages standard cPanel features (MySQL + PHP) to create a lightweight, scalable scoring system with minimal infrastructure changes.

### Key Benefits
- **Zero additional hosting costs** - Uses existing cPanel MySQL & PHP
- **Quick implementation** - Can be deployed in phases starting with 1-2 games
- **Global leaderboards** - Students worldwide can compete
- **Educational analytics** - Track engagement metrics
- **Backward compatible** - Falls back to localStorage if API unavailable

---

## Current State Analysis

### Games Inventory (11 Total)

| Game | Current Scoring | localStorage | Complexity | Priority |
|------|----------------|--------------|------------|----------|
| **FlappyBork** | Points per pipe | ✅ High score saved | Low | **HIGH** ⭐ |
| **Match3** | Combo-based scoring | ✅ High score saved | Medium | **HIGH** ⭐ |
| **Snake** | Length-based | ❌ No persistence | Low | **HIGH** ⭐ |
| **Tetris** | Line clears + combos | ❌ No persistence | Medium | Medium |
| **Pong** | Rally points | ❌ No persistence | Low | Medium |
| **Asteroids** | Destruction + combos | ❌ No persistence | Medium | Medium |
| **Borkout** | Brick destruction | ❌ No persistence | Low | Medium |
| **WordQuestBIO** | Round scoring | ✅ Best score + daily | High | Low |
| **WordQuestENG** | Round scoring | ✅ Best score + daily | High | Low |
| **Parabolic** | Streak-based | ❌ No persistence | Low | Low |

**Priority Rationale:**
- **HIGH** = Simple scoring, broad appeal, already has localStorage (easy migration)
- **Medium** = Good engagement potential, needs some refactoring
- **Low** = Complex existing systems or educational focus (less competitive)

### Current localStorage Implementation Example

```javascript
// FlappyBork.html - Current implementation
let highScore = 0;

// On game start
if (localStorage.getItem('flappyBorkHighScore')) {
  highScore = parseInt(localStorage.getItem('flappyBorkHighScore'));
}

// On new high score
if (score > highScore) {
  highScore = score;
  localStorage.setItem('flappyBorkHighScore', highScore);
}
```

**Limitations:**
- Scores only persist on single device/browser
- No global leaderboards
- Easily manipulated via browser console
- No analytics or engagement tracking
- No player identity/community features

---

## cPanel Resources Available

### Standard cPanel Features (All Shared Hosting Plans)

#### 1. **MySQL Database** ✅
- **Access:** phpMyAdmin (cPanel interface)
- **Version:** Usually MySQL 5.7+ or MariaDB 10.x
- **Resources:** Varies by plan (typically 1GB-unlimited)
- **Setup Time:** < 5 minutes via cPanel wizard

#### 2. **PHP** ✅
- **Version:** PHP 7.4+ or 8.x (configurable via cPanel)
- **Extensions:** mysqli, PDO, JSON (pre-installed)
- **Configuration:** php.ini customizable
- **Perfect for:** RESTful APIs

#### 3. **File Manager** ✅
- Direct file upload/edit capability
- No FTP required (though available)

#### 4. **Cron Jobs** ✅ (Optional)
- For automated cleanup/maintenance
- Leaderboard reset schedules

#### 5. **SSL/HTTPS** ✅
- Free Let's Encrypt certificates
- Essential for secure API calls

### What You DON'T Need
- ❌ Node.js hosting (not required)
- ❌ MongoDB/NoSQL (MySQL is sufficient)
- ❌ Separate API server
- ❌ Redis/caching layer (for initial implementation)
- ❌ Cloud services (AWS, Azure, etc.)

---

## Quick Wins & Implementation Strategy

### Phase 1: MVP (Minimum Viable Product) - **2-4 Hours**

**Scope:** Implement global high scores for 3 simple games

**Quick Win Games:**
1. **FlappyBork** (already has localStorage)
2. **Snake** (simple scoring)
3. **Pong** (simple scoring)

**What You Get:**
- Global leaderboard (Top 100 scores)
- Player name submission
- Basic API (submit score, get leaderboard)
- Fallback to localStorage if API fails

**Effort Breakdown:**
- Database setup: 15 minutes
- PHP API creation: 60 minutes
- Frontend integration (per game): 30 minutes
- Testing: 30 minutes

### Phase 2: Enhanced Features - **4-6 Hours**

**Additions:**
- Daily/Weekly/All-Time leaderboards
- Player profiles (track total scores across games)
- Score verification (basic anti-cheat)
- Admin dashboard (view/moderate scores)

### Phase 3: Advanced Features - **8-12 Hours**

**Additions:**
- Achievement system
- Multiplayer/challenge modes
- Analytics dashboard (games played, completion rates)
- Email notifications for new records

---

## Database Schema Design

### Table Structure

#### `games` Table
Stores metadata about each game.

```sql
CREATE TABLE games (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    game_name VARCHAR(50) UNIQUE NOT NULL,
    game_slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    scoring_type ENUM('points', 'time', 'streak') DEFAULT 'points',
    higher_is_better BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Sample Data:**
```sql
INSERT INTO games (game_name, game_slug, scoring_type, higher_is_better) VALUES
('Flappy Bork', 'flappybork', 'points', TRUE),
('Snake', 'snake', 'points', TRUE),
('Tetris', 'tetris', 'points', TRUE),
('Pong', 'pong', 'points', TRUE),
('Asteroids', 'asteroids', 'points', TRUE),
('Match3', 'match3', 'points', TRUE),
('Borkout', 'borkout', 'points', TRUE),
('WordQuest BIO', 'wordquestbio', 'points', TRUE),
('WordQuest ENG', 'wordquesteng', 'points', TRUE),
('Parabolic', 'parabolic', 'streak', TRUE);
```

#### `high_scores` Table
Stores individual score submissions.

```sql
CREATE TABLE high_scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    session_id VARCHAR(64),
    ip_address VARCHAR(45),
    user_agent TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_score (game_id, score DESC),
    INDEX idx_player (player_name),
    INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Field Explanations:**
- `session_id`: Browser fingerprint (helps detect cheating)
- `ip_address`: For rate limiting and fraud detection
- `user_agent`: Device/browser info for analytics
- `is_verified`: Manual or automated verification flag
- `is_flagged`: Suspicious scores marked for review

#### `players` Table (Phase 2)
Optional table for player profiles.

```sql
CREATE TABLE players (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    total_scores_submitted INT DEFAULT 0,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_banned BOOLEAN DEFAULT FALSE,

    INDEX idx_name (player_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### `leaderboard_cache` Table (Phase 3 - Performance)
Pre-computed leaderboards for fast retrieval.

```sql
CREATE TABLE leaderboard_cache (
    cache_id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    leaderboard_type ENUM('daily', 'weekly', 'monthly', 'alltime') DEFAULT 'alltime',
    cache_data JSON,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_type (game_id, leaderboard_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Database Setup Script

**File:** `database/setup.sql`

```sql
-- Complete setup script for high score database
-- Run this in phpMyAdmin or MySQL command line

-- Create database (if needed)
-- CREATE DATABASE explorable_scores CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE explorable_scores;

-- Games table
CREATE TABLE IF NOT EXISTS games (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    game_name VARCHAR(50) UNIQUE NOT NULL,
    game_slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    scoring_type ENUM('points', 'time', 'streak') DEFAULT 'points',
    higher_is_better BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- High scores table
CREATE TABLE IF NOT EXISTS high_scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    player_name VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    session_id VARCHAR(64),
    ip_address VARCHAR(45),
    user_agent TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    INDEX idx_game_score (game_id, score DESC),
    INDEX idx_player (player_name),
    INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert initial game data
INSERT INTO games (game_name, game_slug, scoring_type, higher_is_better) VALUES
('Flappy Bork', 'flappybork', 'points', TRUE),
('Snake', 'snake', 'points', TRUE),
('Tetris', 'tetris', 'points', TRUE),
('Pong', 'pong', 'points', TRUE),
('Asteroids', 'asteroids', 'points', TRUE),
('Match3', 'match3', 'points', TRUE),
('Borkout', 'borkout', 'points', TRUE),
('WordQuest BIO', 'wordquestbio', 'points', TRUE),
('WordQuest ENG', 'wordquesteng', 'points', TRUE),
('Parabolic', 'parabolic', 'streak', TRUE);

-- Verification
SELECT * FROM games;
```

---

## Backend API Implementation

### File Structure

```
/api/
├── config.php           # Database configuration
├── database.php         # Database connection class
├── submit_score.php     # POST endpoint for score submission
├── get_leaderboard.php  # GET endpoint for retrieving scores
└── .htaccess            # Security rules
```

### 1. Configuration File

**File:** `api/config.php`

```php
<?php
/**
 * Database Configuration
 *
 * IMPORTANT: Update these values in cPanel:
 * 1. Go to cPanel > MySQL Databases
 * 2. Create new database: [username]_explorable_scores
 * 3. Create new user: [username]_score_api
 * 4. Grant ALL PRIVILEGES to user on database
 * 5. Update values below
 */

define('DB_HOST', 'localhost');  // Usually 'localhost' on cPanel
define('DB_NAME', 'your_cpanel_username_explorable_scores');
define('DB_USER', 'your_cpanel_username_score_api');
define('DB_PASS', 'YOUR_SECURE_PASSWORD_HERE');
define('DB_CHARSET', 'utf8mb4');

// API Settings
define('API_VERSION', '1.0');
define('MAX_SCORES_PER_LEADERBOARD', 100);
define('RATE_LIMIT_SUBMISSIONS', 10); // Max submissions per IP per hour
define('MIN_PLAYER_NAME_LENGTH', 2);
define('MAX_PLAYER_NAME_LENGTH', 50);

// Security
define('ALLOWED_ORIGINS', [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
]);

// Error reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Never display errors in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Timezone
date_default_timezone_set('UTC');
?>
```

### 2. Database Connection Class

**File:** `api/database.php`

```php
<?php
/**
 * Database Connection Handler
 * Uses PDO for security and compatibility
 */

require_once 'config.php';

class Database {
    private $connection = null;

    public function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);

        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }

    public function getConnection() {
        return $this->connection;
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query failed: " . $e->getMessage());
            return false;
        }
    }

    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
}
?>
```

### 3. Submit Score Endpoint

**File:** `api/submit_score.php`

```php
<?php
/**
 * Submit Score API Endpoint
 *
 * POST /api/submit_score.php
 * Content-Type: application/json
 *
 * Body: {
 *   "game_slug": "flappybork",
 *   "player_name": "Alice",
 *   "score": 42,
 *   "session_id": "optional-browser-fingerprint"
 * }
 */

header('Content-Type: application/json');
require_once 'config.php';
require_once 'database.php';

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Parse JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Validate required fields
$game_slug = trim($input['game_slug'] ?? '');
$player_name = trim($input['player_name'] ?? '');
$score = $input['score'] ?? null;
$session_id = $input['session_id'] ?? null;

// Validation
$errors = [];

if (empty($game_slug)) {
    $errors[] = 'game_slug is required';
}

if (empty($player_name)) {
    $errors[] = 'player_name is required';
} else if (strlen($player_name) < MIN_PLAYER_NAME_LENGTH) {
    $errors[] = 'player_name too short (min ' . MIN_PLAYER_NAME_LENGTH . ' chars)';
} else if (strlen($player_name) > MAX_PLAYER_NAME_LENGTH) {
    $errors[] = 'player_name too long (max ' . MAX_PLAYER_NAME_LENGTH . ' chars)';
}

// Sanitize player name (alphanumeric + spaces only)
if (!preg_match('/^[a-zA-Z0-9\s]+$/', $player_name)) {
    $errors[] = 'player_name can only contain letters, numbers, and spaces';
}

if ($score === null || !is_numeric($score)) {
    $errors[] = 'score must be a number';
} else if ($score < 0 || $score > 999999999) {
    $errors[] = 'score out of valid range (0-999999999)';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['error' => 'Validation failed', 'details' => $errors]);
    exit;
}

// Rate limiting (simple IP-based)
$ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$db = new Database();

$rate_check = $db->query(
    "SELECT COUNT(*) as count FROM high_scores
     WHERE ip_address = ? AND submitted_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)",
    [$ip_address]
);

if ($rate_check) {
    $rate_data = $rate_check->fetch();
    if ($rate_data['count'] >= RATE_LIMIT_SUBMISSIONS) {
        http_response_code(429);
        echo json_encode(['error' => 'Rate limit exceeded. Please try again later.']);
        exit;
    }
}

// Get game_id from slug
$game_query = $db->query(
    "SELECT game_id FROM games WHERE game_slug = ?",
    [$game_slug]
);

if (!$game_query) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}

$game = $game_query->fetch();
if (!$game) {
    http_response_code(404);
    echo json_encode(['error' => 'Game not found']);
    exit;
}

$game_id = $game['game_id'];

// Insert score
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
$score = intval($score); // Sanitize

$insert = $db->query(
    "INSERT INTO high_scores
     (game_id, player_name, score, session_id, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)",
    [$game_id, $player_name, $score, $session_id, $ip_address, $user_agent]
);

if (!$insert) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save score']);
    exit;
}

$score_id = $db->lastInsertId();

// Get player's rank
$rank_query = $db->query(
    "SELECT COUNT(*) + 1 as rank FROM high_scores
     WHERE game_id = ? AND score > ?",
    [$game_id, $score]
);

$rank = 0;
if ($rank_query) {
    $rank_data = $rank_query->fetch();
    $rank = $rank_data['rank'];
}

// Success response
http_response_code(201);
echo json_encode([
    'success' => true,
    'score_id' => $score_id,
    'rank' => $rank,
    'message' => 'Score submitted successfully'
]);
?>
```

### 4. Get Leaderboard Endpoint

**File:** `api/get_leaderboard.php`

```php
<?php
/**
 * Get Leaderboard API Endpoint
 *
 * GET /api/get_leaderboard.php?game_slug=flappybork&limit=10
 */

header('Content-Type: application/json');
require_once 'config.php';
require_once 'database.php';

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
}

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only accept GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get parameters
$game_slug = trim($_GET['game_slug'] ?? '');
$limit = intval($_GET['limit'] ?? 100);

// Validate
if (empty($game_slug)) {
    http_response_code(400);
    echo json_encode(['error' => 'game_slug is required']);
    exit;
}

if ($limit < 1 || $limit > MAX_SCORES_PER_LEADERBOARD) {
    $limit = MAX_SCORES_PER_LEADERBOARD;
}

$db = new Database();

// Get game info
$game_query = $db->query(
    "SELECT game_id, game_name, higher_is_better FROM games WHERE game_slug = ?",
    [$game_slug]
);

if (!$game_query) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit;
}

$game = $game_query->fetch();
if (!$game) {
    http_response_code(404);
    echo json_encode(['error' => 'Game not found']);
    exit;
}

$game_id = $game['game_id'];
$order = $game['higher_is_better'] ? 'DESC' : 'ASC';

// Get leaderboard
$leaderboard_query = $db->query(
    "SELECT
        player_name,
        score,
        DATE_FORMAT(submitted_at, '%Y-%m-%d %H:%i') as submitted_at
     FROM high_scores
     WHERE game_id = ? AND is_flagged = FALSE
     ORDER BY score $order, submitted_at ASC
     LIMIT ?",
    [$game_id, $limit]
);

if (!$leaderboard_query) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to retrieve leaderboard']);
    exit;
}

$scores = $leaderboard_query->fetchAll();

// Add rank numbers
$ranked_scores = [];
$rank = 1;
foreach ($scores as $score_entry) {
    $ranked_scores[] = array_merge(['rank' => $rank], $score_entry);
    $rank++;
}

// Success response
echo json_encode([
    'game' => $game['game_name'],
    'game_slug' => $game_slug,
    'total_entries' => count($ranked_scores),
    'leaderboard' => $ranked_scores
]);
?>
```

### 5. Security .htaccess

**File:** `api/.htaccess`

```apache
# Disable directory browsing
Options -Indexes

# Prevent access to config files
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>

<Files "database.php">
    Order allow,deny
    Deny from all
</Files>

# Enable error log protection
<Files "error.log">
    Order allow,deny
    Deny from all
</Files>

# Force HTTPS (if available)
# Uncomment after SSL is configured
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Frontend Integration

### JavaScript API Client

**File:** `Games/shared/highscore-api.js` (Create this reusable module)

```javascript
/**
 * High Score API Client
 * Reusable module for all games
 *
 * Usage:
 * <script src="/Games/shared/highscore-api.js"></script>
 *
 * const api = new HighScoreAPI('flappybork');
 * await api.submitScore('PlayerName', 100);
 * const leaderboard = await api.getLeaderboard(10);
 */

class HighScoreAPI {
  constructor(gameSlug) {
    this.gameSlug = gameSlug;
    this.apiBase = '/api'; // Adjust based on your setup
    this.sessionId = this.generateSessionId();
    this.fallbackKey = `${gameSlug}_highscore`;
  }

  /**
   * Generate a simple browser fingerprint
   */
  generateSessionId() {
    const nav = navigator;
    const screen = window.screen;
    const data = [
      nav.userAgent,
      nav.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset()
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Submit a score to the API
   * Falls back to localStorage if API fails
   */
  async submitScore(playerName, score) {
    try {
      const response = await fetch(`${this.apiBase}/submit_score.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_slug: this.gameSlug,
          player_name: playerName,
          score: score,
          session_id: this.sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Also save to localStorage as backup
      this.saveLocalScore(playerName, score);

      return data;

    } catch (error) {
      console.warn('API submission failed, using localStorage:', error);
      this.saveLocalScore(playerName, score);
      return { success: false, fallback: true };
    }
  }

  /**
   * Get leaderboard from API
   * Falls back to localStorage if API fails
   */
  async getLeaderboard(limit = 10) {
    try {
      const response = await fetch(
        `${this.apiBase}/get_leaderboard.php?game_slug=${this.gameSlug}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.leaderboard || [];

    } catch (error) {
      console.warn('API fetch failed, using localStorage:', error);
      return this.getLocalLeaderboard();
    }
  }

  /**
   * Save score to localStorage (fallback)
   */
  saveLocalScore(playerName, score) {
    const current = this.getLocalHighScore();
    if (score > current.score) {
      localStorage.setItem(this.fallbackKey, JSON.stringify({
        player_name: playerName,
        score: score,
        submitted_at: new Date().toISOString()
      }));
    }
  }

  /**
   * Get high score from localStorage
   */
  getLocalHighScore() {
    const data = localStorage.getItem(this.fallbackKey);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return { score: 0 };
      }
    }
    return { score: 0 };
  }

  /**
   * Get local leaderboard (single entry for fallback)
   */
  getLocalLeaderboard() {
    const local = this.getLocalHighScore();
    if (local.score > 0) {
      return [{
        rank: 1,
        player_name: local.player_name,
        score: local.score,
        submitted_at: local.submitted_at,
        local: true
      }];
    }
    return [];
  }

  /**
   * Prompt user for name
   */
  promptForPlayerName() {
    const stored = localStorage.getItem('player_name');
    let name = prompt('Enter your name for the leaderboard:', stored || '');

    if (name && name.trim().length >= 2) {
      name = name.trim().substring(0, 50);
      localStorage.setItem('player_name', name);
      return name;
    }

    return null;
  }
}
```

### Example Integration: FlappyBork

**Modifications to FlappyBork.html:**

```javascript
// Add at the top of the file (after p5.js script tag)
// <script src="/Games/shared/highscore-api.js"></script>

// Initialize API client
let scoreAPI;
let playerName = localStorage.getItem('player_name') || 'Player';

function setup() {
  // ... existing setup code ...

  // Initialize high score API
  scoreAPI = new HighScoreAPI('flappybork');

  // Load local high score (backward compatible)
  const localHigh = scoreAPI.getLocalHighScore();
  if (localHigh.score > highScore) {
    highScore = localHigh.score;
  }
}

// Modify the game over section
function draw() {
  // ... existing code ...

  if (gameover) {
    // ... existing game over display ...

    // Show leaderboard button
    textAlign(CENTER);
    fill(255);
    text("Press L to view Leaderboard", width / 2, height - 40);

    // If new high score, prompt for submission
    if (score > 0 && !scoreSubmitted) {
      submitHighScore();
    }
  }
}

let scoreSubmitted = false;

async function submitHighScore() {
  if (score > 0 && !scoreSubmitted) {
    scoreSubmitted = true;

    // Prompt for name if not set
    if (!playerName || playerName === 'Player') {
      playerName = scoreAPI.promptForPlayerName();
      if (!playerName) {
        playerName = 'Anonymous';
      }
    }

    // Submit to API
    const result = await scoreAPI.submitScore(playerName, score);

    if (result.success) {
      console.log(`Score submitted! Rank: ${result.rank}`);
    }
  }
}

// Add keyboard handler for leaderboard
function keyPressed() {
  // ... existing key handlers ...

  if (key === 'l' || key === 'L') {
    showLeaderboard();
  }
}

async function showLeaderboard() {
  const leaderboard = await scoreAPI.getLeaderboard(10);

  // Display leaderboard (simple alert for now)
  if (leaderboard.length > 0) {
    let message = "🏆 TOP 10 LEADERBOARD 🏆\n\n";
    leaderboard.forEach(entry => {
      message += `${entry.rank}. ${entry.player_name}: ${entry.score}\n`;
    });
    alert(message);
  } else {
    alert("No scores yet. Be the first!");
  }
}
```

### Enhanced Leaderboard UI (Optional)

**Create a modal overlay instead of alert:**

```html
<!-- Add to game HTML -->
<div id="leaderboard-modal" style="display:none;">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <h2>🏆 Leaderboard</h2>
    <div id="leaderboard-list"></div>
    <button onclick="closeLeaderboard()">Close</button>
  </div>
</div>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  z-index: 999;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.modal-content h2 {
  margin-top: 0;
  text-align: center;
}

#leaderboard-list {
  margin: 20px 0;
}

.leaderboard-entry {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 5px 0;
  background: #f5f5f5;
  border-radius: 5px;
}

.leaderboard-entry.top3 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  font-weight: bold;
}

.modal-content button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.modal-content button:hover {
  background: #0056b3;
}
</style>

<script>
async function showLeaderboard() {
  const leaderboard = await scoreAPI.getLeaderboard(10);
  const listDiv = document.getElementById('leaderboard-list');

  if (leaderboard.length > 0) {
    listDiv.innerHTML = leaderboard.map(entry => `
      <div class="leaderboard-entry ${entry.rank <= 3 ? 'top3' : ''}">
        <span>${entry.rank}. ${entry.player_name}</span>
        <span>${entry.score}</span>
      </div>
    `).join('');
  } else {
    listDiv.innerHTML = '<p style="text-align:center">No scores yet!</p>';
  }

  document.getElementById('leaderboard-modal').style.display = 'block';
}

function closeLeaderboard() {
  document.getElementById('leaderboard-modal').style.display = 'none';
}
</script>
```

---

## Security Considerations

### 1. Input Validation (CRITICAL)

**Already implemented in API:**
- ✅ Player name: alphanumeric + spaces only, 2-50 chars
- ✅ Score: integer, 0-999999999 range
- ✅ SQL injection prevention via PDO prepared statements
- ✅ XSS prevention via JSON output (no HTML)

**Additional measures:**
```php
// Add to submit_score.php for extra paranoia
$player_name = htmlspecialchars($player_name, ENT_QUOTES, 'UTF-8');
```

### 2. Rate Limiting

**Current implementation:**
- 10 submissions per IP per hour
- Tracked via database

**Enhanced version (Phase 2):**
```php
// Add more sophisticated rate limiting
// In submit_score.php, add session-based limiting:

if (!isset($_SESSION['submissions'])) {
    $_SESSION['submissions'] = [];
}

$now = time();
$_SESSION['submissions'] = array_filter(
    $_SESSION['submissions'],
    fn($t) => $now - $t < 3600
);

if (count($_SESSION['submissions']) >= RATE_LIMIT_SUBMISSIONS) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many submissions']);
    exit;
}

$_SESSION['submissions'][] = $now;
```

### 3. Score Validation (Anti-Cheat)

**Basic detection (Phase 2):**

```php
// Add to submit_score.php after score insertion

// Flag impossibly high scores
$max_reasonable_scores = [
    'flappybork' => 500,
    'snake' => 1000,
    'tetris' => 100000,
    // ... etc
];

if (isset($max_reasonable_scores[$game_slug])) {
    $max = $max_reasonable_scores[$game_slug];
    if ($score > $max) {
        $db->query(
            "UPDATE high_scores SET is_flagged = TRUE WHERE score_id = ?",
            [$score_id]
        );
    }
}

// Flag duplicate submissions (same IP + name + score within 1 minute)
$duplicate_check = $db->query(
    "SELECT COUNT(*) as count FROM high_scores
     WHERE ip_address = ?
       AND player_name = ?
       AND score = ?
       AND submitted_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)",
    [$ip_address, $player_name, $score]
);

if ($duplicate_check && $duplicate_check->fetch()['count'] > 0) {
    $db->query(
        "UPDATE high_scores SET is_flagged = TRUE WHERE score_id = ?",
        [$score_id]
    );
}
```

### 4. HTTPS Enforcement

**Update .htaccess after SSL is configured:**

```apache
# In api/.htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 5. Database Security

**User permissions (run in phpMyAdmin):**

```sql
-- Create restricted user for API
CREATE USER 'score_api_user'@'localhost' IDENTIFIED BY 'secure_password_here';

-- Grant only necessary privileges
GRANT SELECT, INSERT ON explorable_scores.games TO 'score_api_user'@'localhost';
GRANT SELECT, INSERT, UPDATE ON explorable_scores.high_scores TO 'score_api_user'@'localhost';

FLUSH PRIVILEGES;
```

### 6. CORS Configuration

**Update config.php with your actual domains:**

```php
define('ALLOWED_ORIGINS', [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:8000'  // Only for testing, remove in production
]);
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Backup existing site** (via cPanel > File Manager > Compress > Download)
- [ ] **Create MySQL database** via cPanel > MySQL Databases
  - Database name: `[username]_explorable_scores`
  - Username: `[username]_score_api`
  - Password: Generate strong password (save in password manager)
  - Grant ALL privileges
- [ ] **Enable SSL certificate** via cPanel > SSL/TLS Status (free Let's Encrypt)
- [ ] **Update config.php** with database credentials
- [ ] **Update ALLOWED_ORIGINS** in config.php with your domain

### Deployment Steps

1. **Upload API files** (via cPanel File Manager or FTP)
   ```
   /public_html/api/
   ├── config.php
   ├── database.php
   ├── submit_score.php
   ├── get_leaderboard.php
   └── .htaccess
   ```

2. **Run database setup**
   - Login to phpMyAdmin
   - Select your database
   - Click "SQL" tab
   - Paste contents of `database/setup.sql`
   - Click "Go"
   - Verify tables created successfully

3. **Upload JavaScript API client**
   ```
   /public_html/Games/shared/
   └── highscore-api.js
   ```

4. **Test API endpoints**
   - Submit test score: Use browser console or Postman
   ```javascript
   fetch('https://yourdomain.com/api/submit_score.php', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       game_slug: 'flappybork',
       player_name: 'TestPlayer',
       score: 42
     })
   }).then(r => r.json()).then(console.log);
   ```

   - Get leaderboard:
   ```javascript
   fetch('https://yourdomain.com/api/get_leaderboard.php?game_slug=flappybork')
     .then(r => r.json())
     .then(console.log);
   ```

5. **Integrate first game** (FlappyBork recommended)
   - Add `<script src="/Games/shared/highscore-api.js"></script>`
   - Add integration code (see Frontend Integration section)
   - Test thoroughly

6. **Monitor error logs**
   - Check `/api/error.log` for any PHP errors
   - Fix any issues before rolling out to more games

### Post-Deployment

- [ ] Test from multiple devices (desktop, mobile, tablet)
- [ ] Test with slow network (throttle in browser DevTools)
- [ ] Verify localStorage fallback works (disable network in DevTools)
- [ ] Test rate limiting (submit 11 scores rapidly)
- [ ] Check leaderboard display on all games
- [ ] Monitor database size (should be negligible initially)
- [ ] Set up weekly database backups (cPanel > Backup Wizard)

---

## Maintenance & Monitoring

### Daily Checks (Automated via Cron)

**File:** `/scripts/cleanup.php`

```php
<?php
// Run daily via cron: 0 3 * * * /usr/bin/php /path/to/cleanup.php

require_once __DIR__ . '/../api/config.php';
require_once __DIR__ . '/../api/database.php';

$db = new Database();

// Delete flagged scores older than 30 days
$db->query(
    "DELETE FROM high_scores
     WHERE is_flagged = TRUE AND submitted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
);

// Delete excessive scores beyond top 1000 per game
$db->query(
    "DELETE FROM high_scores
     WHERE score_id NOT IN (
         SELECT score_id FROM (
             SELECT score_id FROM high_scores
             ORDER BY game_id, score DESC, submitted_at ASC
             LIMIT 1000
         ) AS top_scores
     )"
);

echo "Cleanup completed: " . date('Y-m-d H:i:s') . "\n";
?>
```

**Setup cron job in cPanel:**
1. Go to cPanel > Cron Jobs
2. Add new cron job
3. Schedule: `0 3 * * *` (3 AM daily)
4. Command: `/usr/bin/php /home/username/public_html/scripts/cleanup.php`

### Weekly Reviews

- Review flagged scores manually (phpMyAdmin)
- Check disk usage (cPanel > Disk Usage)
- Verify backups are running
- Review error logs for anomalies

### Monthly Tasks

- Analyze popular games via query:
```sql
SELECT g.game_name, COUNT(*) as total_submissions
FROM high_scores hs
JOIN games g ON hs.game_id = g.game_id
WHERE hs.submitted_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY g.game_name
ORDER BY total_submissions DESC;
```

- Review and adjust rate limits if needed
- Update reasonable score thresholds based on data

### Database Size Estimates

**Per score entry:** ~200 bytes
**1,000 scores:** ~200 KB
**100,000 scores:** ~20 MB

Even with heavy usage (1 million scores), database would only be ~200 MB, well within cPanel limits.

---

## Appendix: Quick Reference

### API Endpoints Summary

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/api/submit_score.php` | POST | Submit new score | `game_slug`, `player_name`, `score`, `session_id` |
| `/api/get_leaderboard.php` | GET | Get top scores | `game_slug`, `limit` (optional) |

### JavaScript API Methods

```javascript
const api = new HighScoreAPI('flappybork');

// Submit score
await api.submitScore('PlayerName', 100);

// Get leaderboard
const scores = await api.getLeaderboard(10);

// Get local high score (fallback)
const local = api.getLocalHighScore();

// Prompt for player name
const name = api.promptForPlayerName();
```

### Common SQL Queries

```sql
-- Get top 10 for a game
SELECT player_name, score
FROM high_scores
WHERE game_id = 1
ORDER BY score DESC
LIMIT 10;

-- Get total submissions by game
SELECT g.game_name, COUNT(*) as submissions
FROM high_scores hs
JOIN games g ON hs.game_id = g.game_id
GROUP BY g.game_name;

-- Find suspicious scores
SELECT * FROM high_scores
WHERE is_flagged = TRUE
ORDER BY submitted_at DESC;

-- Delete all scores for a game (use carefully!)
DELETE FROM high_scores WHERE game_id = 1;
```

### Troubleshooting

**Problem:** "Database connection failed"
**Solution:** Check config.php credentials, verify database exists in cPanel

**Problem:** "CORS error in browser console"
**Solution:** Verify ALLOWED_ORIGINS in config.php matches your domain exactly

**Problem:** "Score not appearing in leaderboard"
**Solution:** Check if is_flagged = TRUE in database, adjust anti-cheat thresholds

**Problem:** "Rate limit too restrictive"
**Solution:** Increase RATE_LIMIT_SUBMISSIONS in config.php

---

## Conclusion

This implementation provides a production-ready, cPanel-optimized high-score system that:

✅ Uses only standard cPanel features (no extra costs)
✅ Scales from MVP to advanced features
✅ Maintains backward compatibility
✅ Includes security best practices
✅ Provides analytics opportunities

**Recommended Next Steps:**

1. Set up database and API (Phase 1) - **2 hours**
2. Integrate FlappyBork as proof of concept - **30 minutes**
3. Test thoroughly - **30 minutes**
4. Roll out to Snake and Pong - **1 hour**
5. Gather user feedback
6. Implement Phase 2 features based on demand

**Total time to working prototype:** ~4 hours

Good luck with your implementation! This will significantly enhance the educational and competitive aspects of your Explorable Explanations platform.
