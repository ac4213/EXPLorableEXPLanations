<?php
/**
 * Get Leaderboard API Endpoint
 *
 * GET /api/get_leaderboard.php?game_slug=flappybork&limit=10
 *
 * Query Parameters:
 * - game_slug (required): The game identifier (e.g., "flappybork")
 * - limit (optional): Number of scores to return (default: 100, max: 100)
 *
 * Response (Success):
 * {
 *   "game": "Flappy Bork",
 *   "game_slug": "flappybork",
 *   "total_entries": 10,
 *   "leaderboard": [
 *     {
 *       "rank": 1,
 *       "player_name": "Alice",
 *       "score": 100,
 *       "submitted_at": "2025-11-15 12:30"
 *     },
 *     ...
 *   ]
 * }
 */

header('Content-Type: application/json');
require_once 'config.php';
require_once 'database.php';

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Credentials: true");
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
    echo json_encode(['error' => 'game_slug parameter is required']);
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
    echo json_encode(['error' => 'Game not found', 'game_slug' => $game_slug]);
    exit;
}

$game_id = $game['game_id'];
$order = $game['higher_is_better'] ? 'DESC' : 'ASC';

// Get leaderboard (exclude flagged scores)
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
    $ranked_scores[] = [
        'rank' => $rank,
        'player_name' => $score_entry['player_name'],
        'score' => intval($score_entry['score']),
        'submitted_at' => $score_entry['submitted_at']
    ];
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
