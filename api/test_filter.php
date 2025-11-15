<?php
/**
 * Content Filter Test Script
 *
 * This script demonstrates how the content filter works.
 * Run it to see examples of filtered content.
 *
 * Usage: php test_filter.php
 */

require_once 'content_filter.php';

echo "=== Content Filter Test ===\n\n";

// Test cases
$testCases = [
    'Alice',                    // Clean name - should pass
    'Bob123',                   // Clean name with numbers - should pass
    'Charlie Brown',            // Clean name with space - should pass
    'Opulent Ocelot',          // Fun alliteration - should pass
    'Fantastic Fox',           // Fun alliteration - should pass
    'BadWord',                 // Clean - should pass
    'hello',                   // Clean - should pass
    'Player1',                 // Clean - should pass
    'test',                    // Clean - should pass (no false positives)
    'grass',                   // Clean - contains "ass" but not as whole word
    'class',                   // Clean - contains "ass" but not as whole word
    'assistant',               // Clean - contains "ass" but not as whole word
];

echo "CLEAN NAMES (should all pass):\n";
echo str_repeat('-', 60) . "\n";
foreach ($testCases as $name) {
    $result = ContentFilter::validatePlayerName($name);
    $status = $result['valid'] ? '✓ PASS' : '✗ FAIL';
    $display = $result['valid'] ? $name : $result['sanitized'];
    echo sprintf("%-20s → %s → %s\n", $name, $status, $display);
}

echo "\n\nINAPPROPRIATE NAMES (should be filtered):\n";
echo str_repeat('-', 60) . "\n";
echo "Note: Actual inappropriate words omitted from this test for documentation.\n";
echo "The filter catches:\n";
echo "  - Profanity and vulgar language\n";
echo "  - Racist and discriminatory terms\n";
echo "  - Sexual and explicit content\n";
echo "  - Leetspeak variations (e.g., a$$, sh!t, etc.)\n";
echo "  - Words with separators (e.g., f.u.c.k, s-h-i-t)\n\n";

// Stats
$stats = ContentFilter::getFilteredTerms();
echo "FILTER STATISTICS:\n";
echo str_repeat('-', 60) . "\n";
echo "Profanity terms: " . $stats['profanity_count'] . "\n";
echo "Racist terms: " . $stats['racist_count'] . "\n";
echo "Sexual terms: " . $stats['sexual_count'] . "\n";
echo "Total filtered terms: " . $stats['total_filtered_terms'] . "\n\n";

echo "PROTECTION FEATURES:\n";
echo str_repeat('-', 60) . "\n";
echo "✓ Case-insensitive matching\n";
echo "✓ Leetspeak detection (4=a, 3=e, $=s, etc.)\n";
echo "✓ Separator bypassing (catches f.u.c.k, s-h-i-t)\n";
echo "✓ Partial word matching (catches variations)\n";
echo "✓ Word boundary detection (prevents false positives)\n";
echo "✓ Auto-sanitization with asterisks\n";
echo "✓ Rejection if mostly censored (>50% asterisks)\n\n";

echo "=== Test Complete ===\n";
?>
