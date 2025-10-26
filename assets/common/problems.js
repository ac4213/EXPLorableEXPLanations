/* ============================================
   Common Problem Functions
   Shared JavaScript for practice problems across all pages
   ============================================ */

/**
 * Toggle visibility of problem solutions
 * @param {string} id - The ID of the solution element to toggle
 */
function toggleSolution(id) {
    const solution = document.getElementById(id);
    if (solution.classList.contains('hidden')) {
        solution.classList.remove('hidden');
        solution.previousElementSibling.textContent = "Hide Solution";
    } else {
        solution.classList.add('hidden');
        solution.previousElementSibling.textContent = "Show Solution";
    }
}

/**
 * Check if a numeric answer is correct within a tolerance
 * @param {number} userAnswer - The user's answer
 * @param {number} correctAnswer - The correct answer
 * @param {number} tolerance - Acceptable tolerance (default 0.01 or 1%)
 * @returns {boolean} - True if answer is within tolerance
 */
function checkNumericAnswer(userAnswer, correctAnswer, tolerance = 0.01) {
    const diff = Math.abs(userAnswer - correctAnswer);
    const threshold = Math.abs(correctAnswer * tolerance);
    return diff <= threshold;
}

/**
 * Display feedback for a problem answer
 * @param {string} feedbackId - The ID of the feedback element
 * @param {boolean} isCorrect - Whether the answer is correct
 * @param {string} message - Optional custom message
 */
function displayFeedback(feedbackId, isCorrect, message = null) {
    const feedbackElement = document.getElementById(feedbackId);
    if (!feedbackElement) return;

    if (isCorrect) {
        feedbackElement.textContent = message || "✓ Correct!";
        feedbackElement.style.color = "#28a745";
        feedbackElement.style.fontWeight = "bold";
    } else {
        feedbackElement.textContent = message || "✗ Incorrect. Try again.";
        feedbackElement.style.color = "#dc3545";
        feedbackElement.style.fontWeight = "bold";
    }
    feedbackElement.style.display = "block";
}

/**
 * Format a number for display with specified decimal places
 * @param {number} value - The number to format
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} - Formatted number string
 */
function formatNumber(value, decimals = 2) {
    return value.toFixed(decimals);
}

/**
 * Parse user input and convert to number, handling various formats
 * @param {string} input - The user's input string
 * @returns {number|null} - Parsed number or null if invalid
 */
function parseUserInput(input) {
    // Remove whitespace and common non-numeric characters
    const cleaned = input.trim().replace(/[,\s]/g, '');
    const number = parseFloat(cleaned);
    return isNaN(number) ? null : number;
}
