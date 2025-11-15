<?php
/**
 * High Score API Configuration
 *
 * IMPORTANT SETUP INSTRUCTIONS:
 * =============================
 *
 * 1. CREATE DATABASE IN CPANEL:
 *    - Login to cPanel
 *    - Go to "MySQL Databases"
 *    - Create new database: [username]_explorable_scores
 *    - Create new user: [username]_score_api
 *    - Generate a strong password (save it!)
 *    - Add user to database with ALL PRIVILEGES
 *
 * 2. UPDATE THIS FILE:
 *    - Replace DB_NAME with your actual database name
 *    - Replace DB_USER with your actual username
 *    - Replace DB_PASS with your actual password
 *
 * 3. UPDATE ALLOWED_ORIGINS:
 *    - Replace 'https://yourdomain.com' with your actual domain
 *    - Remove localhost entry when deploying to production
 *
 * =============================
 */

// Database Configuration
// CHANGE THESE VALUES BEFORE DEPLOYMENT!
define('DB_HOST', 'localhost');  // Usually 'localhost' on cPanel
define('DB_NAME', 'arncoven_hiscores');  // CHANGE THIS!
define('DB_USER', 'arncoven_scoreapi ');          // CHANGE THIS!
define('DB_PASS', 'WL3Ee7q8uuQVQRp4vLJV');               // CHANGE THIS!
define('DB_CHARSET', 'utf8mb4');

// API Settings
define('API_VERSION', '1.0');
define('MAX_SCORES_PER_LEADERBOARD', 50);
define('RATE_LIMIT_SUBMISSIONS', 50); // Max submissions per IP per hour
define('MIN_PLAYER_NAME_LENGTH', 3);
define('MAX_PLAYER_NAME_LENGTH', 30);

// CORS Configuration
// IMPORTANT: Update with your actual domain(s)
define('ALLOWED_ORIGINS', [
    'https://arn.coventry.domains',           // CHANGE THIS!
    'https://www.arn.coventry.domains',       // CHANGE THIS!
    //'http://localhost:8000',            // For local testing - REMOVE in production!
    //'http://127.0.0.1:8000'             // For local testing - REMOVE in production!
]);

// Error Reporting
// Set to 0 in production for security
error_reporting(E_ALL);
ini_set('display_errors', 0);  // Never display errors to users (security risk)
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Timezone
date_default_timezone_set('UTC');

// Maximum reasonable scores (for anti-cheat detection)
// Scores above these thresholds will be flagged for review
define('MAX_REASONABLE_SCORES', [
    'flappybork' => 500,
    'snake' => 1000,
    'tetris' => 100000,
    'pong' => 500,
    'asteroids' => 50000,
    'match3' => 100000,
    'borkout' => 50000,
    'wordquestbio' => 10000,
    'wordquesteng' => 10000,
    'parabolic' => 100
]);
?>
