<?php
/**
 * Content Filter - Profanity and Inappropriate Content Detection
 *
 * This filter prevents vulgar, racist, and inappropriate content from
 * appearing in the leaderboard. It uses pattern matching to catch
 * variations including leetspeak.
 */

class ContentFilter {

    // Profanity and vulgar terms (basic list - expand as needed)
    private static $profanity = [
        'ass', 'arse', 'bastard', 'bitch', 'cock', 'crap', 'damn', 'dick',
        'fuck', 'hell', 'piss', 'pussy', 'shit', 'slut', 'tits', 'whore',
        'asshole', 'bollocks', 'bugger', 'cunt', 'fag', 'motherfucker',
        'twat', 'wanker', 'prick', 'douche', 'screw', 'suck', 'wtf',
        'stfu', 'bullshit', 'horseshit', 'jackass', 'dumbass', 'dipshit'
    ];

    // Racist and discriminatory terms
    private static $racist = [
        'nigger', 'nigga', 'chink', 'spic', 'wetback', 'kike', 'raghead',
        'cracker', 'honky', 'gook', 'beaner', 'towelhead', 'jap', 'retard',
        'faggot', 'tranny', 'dyke', 'chinaman', 'negro', 'coon', 'jihad',
        'nazi', 'hitler', 'kkk', 'terrorist', 'thug'
    ];

    // Sexual and inappropriate terms
    private static $sexual = [
        'anal', 'blowjob', 'boob', 'dildo', 'foreskin', 'jizz', 'masturbate',
        'orgasm', 'penis', 'porn', 'rape', 'sex', 'vagina', 'viagra',
        'xxx', 'nude', 'naked', 'horny', 'kinky', 'erotic', 'fetish'
    ];

    // Common leetspeak substitutions
    private static $leetspeak = [
        '4' => 'a',
        '8' => 'b',
        '3' => 'e',
        '1' => 'i',
        '0' => 'o',
        '5' => 's',
        '7' => 't',
        '$' => 's',
        '@' => 'a',
        '!' => 'i',
        '(' => 'c',
        ')' => 'c',
        '+' => 't',
        '|' => 'i',
        '*' => 'a'
    ];

    /**
     * Check if text contains inappropriate content
     * @param string $text The text to check
     * @return bool True if inappropriate content detected
     */
    public static function containsInappropriateContent($text) {
        if (empty($text)) {
            return false;
        }

        // Normalize text for checking
        $normalized = self::normalizeText($text);

        // Check against all word lists
        $allBadWords = array_merge(
            self::$profanity,
            self::$racist,
            self::$sexual
        );

        foreach ($allBadWords as $badWord) {
            // Check for whole word matches (with word boundaries)
            if (preg_match('/\b' . preg_quote($badWord, '/') . '\b/i', $normalized)) {
                return true;
            }

            // Check for partial matches (catches variations)
            if (stripos($normalized, $badWord) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Sanitize text by replacing inappropriate content with asterisks
     * @param string $text The text to sanitize
     * @return string Sanitized text
     */
    public static function sanitize($text) {
        if (empty($text)) {
            return $text;
        }

        // Normalize for detection
        $normalized = self::normalizeText($text);

        // Check against all word lists
        $allBadWords = array_merge(
            self::$profanity,
            self::$racist,
            self::$sexual
        );

        $sanitized = $text;

        foreach ($allBadWords as $badWord) {
            // Replace whole words (case insensitive)
            $pattern = '/\b(' . preg_quote($badWord, '/') . ')\b/i';
            $sanitized = preg_replace_callback($pattern, function($matches) {
                return str_repeat('*', strlen($matches[1]));
            }, $sanitized);

            // Also catch partial matches (like "a$$hole")
            $pattern = '/' . preg_quote($badWord, '/') . '/i';
            if (preg_match($pattern, $normalized)) {
                // Find the position in original text
                $pos = stripos($normalized, $badWord);
                if ($pos !== false) {
                    $length = strlen($badWord);
                    $sanitized = substr_replace($sanitized, str_repeat('*', $length), $pos, $length);
                }
            }
        }

        return $sanitized;
    }

    /**
     * Normalize text for checking (converts leetspeak, removes special chars)
     * @param string $text The text to normalize
     * @return string Normalized text
     */
    private static function normalizeText($text) {
        $text = strtolower($text);

        // Convert leetspeak to regular letters
        $text = str_replace(
            array_keys(self::$leetspeak),
            array_values(self::$leetspeak),
            $text
        );

        // Remove common separators (catches "f.u.c.k", "f-u-c-k", etc.)
        $text = str_replace(['.', '-', '_', ' ', '+', '='], '', $text);

        return $text;
    }

    /**
     * Validate player name and return sanitized version
     * @param string $name The player name to validate
     * @return array ['valid' => bool, 'sanitized' => string, 'reason' => string]
     */
    public static function validatePlayerName($name) {
        // Check if contains inappropriate content
        if (self::containsInappropriateContent($name)) {
            return [
                'valid' => false,
                'sanitized' => self::sanitize($name),
                'reason' => 'Name contains inappropriate content'
            ];
        }

        return [
            'valid' => true,
            'sanitized' => $name,
            'reason' => ''
        ];
    }

    /**
     * Get a list of all filtered terms (for testing/admin purposes)
     * @return array
     */
    public static function getFilteredTerms() {
        return [
            'profanity_count' => count(self::$profanity),
            'racist_count' => count(self::$racist),
            'sexual_count' => count(self::$sexual),
            'total_filtered_terms' => count(self::$profanity) + count(self::$racist) + count(self::$sexual)
        ];
    }
}
?>
