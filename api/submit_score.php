<?php
/**
 * Submit Score API Endpoint
 *
 * POST /api/submit_score.php
 * Content-Type: application/json
 *
 * Request Body:
 * {
 *   "game_slug": "flappybork",
 *   "player_name": "Alice",
 *   "score": 42,
 *   "session_id": "optional-browser-fingerprint"
 * }
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "score_id": 123,
 *   "rank": 5,
 *   "message": "Score submitted successfully"
 * }
 */

header('Content-Type: application/json');
require_once 'config.php';
require_once 'database.php';
require_once 'content_filter.php';

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Credentials: true");
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

// Extract and sanitize input
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
if (!empty($player_name) && !preg_match('/^[a-zA-Z0-9\s]+$/', $player_name)) {
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

// Additional sanitization
$player_name = htmlspecialchars($player_name, ENT_QUOTES, 'UTF-8');
$score = intval($score);

// Content filtering - check for inappropriate names
$filterResult = ContentFilter::validatePlayerName($player_name);
if (!$filterResult['valid']) {
    // Auto-sanitize the name instead of rejecting
    $player_name = $filterResult['sanitized'];

    // If after sanitization it's mostly asterisks, reject it
    $asteriskRatio = substr_count($player_name, '*') / max(strlen($player_name), 1);
    if ($asteriskRatio > 0.5) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Inappropriate player name',
            'message' => 'Please choose a different name. Inappropriate content is not allowed.'
        ]);
        exit;
    }
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
        echo json_encode([
            'error' => 'Rate limit exceeded',
            'message' => 'Too many score submissions. Please try again later.'
        ]);
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
    echo json_encode(['error' => 'Game not found', 'game_slug' => $game_slug]);
    exit;
}

$game_id = $game['game_id'];

// Check for duplicate submission (same player, same score, within 1 minute)
$duplicate_check = $db->query(
    "SELECT COUNT(*) as count FROM high_scores
     WHERE game_id = ?
       AND player_name = ?
       AND score = ?
       AND submitted_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)",
    [$game_id, $player_name, $score]
);

if ($duplicate_check && $duplicate_check->fetch()['count'] > 0) {
    http_response_code(409);
    echo json_encode([
        'error' => 'Duplicate submission',
        'message' => 'You just submitted this score. Please wait before submitting again.'
    ]);
    exit;
}

// Insert score
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

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

// Flag if score is suspiciously high
$max_reasonable = MAX_REASONABLE_SCORES[$game_slug] ?? 999999999;
$is_flagged = $score > $max_reasonable;

if ($is_flagged) {
    $db->query(
        "UPDATE high_scores SET is_flagged = TRUE WHERE score_id = ?",
        [$score_id]
    );
}

// Get player's rank (only count non-flagged scores)
$rank_query = $db->query(
    "SELECT COUNT(*) + 1 as rank FROM high_scores
     WHERE game_id = ? AND score > ? AND is_flagged = FALSE",
    [$game_id, $score]
);

$rank = 0;
if ($rank_query) {
    $rank_data = $rank_query->fetch();
    $rank = $rank_data['rank'];
}

// Success response
http_response_code(201);
$response = [
    'success' => true,
    'score_id' => intval($score_id),
    'rank' => intval($rank),
    'is_flagged' => $is_flagged,
    'player_name' => $player_name,  // Return actual name used (may be sanitized)
    'message' => $is_flagged
        ? 'Score submitted but flagged for review (unusually high)'
        : 'Score submitted successfully'
];

// Add warning if name was sanitized
if (!$filterResult['valid']) {
    $response['name_sanitized'] = true;
    $response['message'] .= ' (Note: inappropriate content was filtered from your name)';
}

echo json_encode($response);
?>
