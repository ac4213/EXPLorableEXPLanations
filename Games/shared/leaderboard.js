/**
 * Global Leaderboard Functions
 * Common functions for all games to display and manage leaderboards
 */

/**
 * Initialize the leaderboard modal HTML
 * Call this once when the page loads
 */
function initLeaderboardModal() {
  // Check if modal already exists
  if (document.getElementById('leaderboard-modal')) {
    return;
  }

  // Create modal HTML
  const modalHTML = `
    <div id="leaderboard-modal" class="modal-overlay" onclick="closeLeaderboard()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <h2>🏆 Leaderboard 🏆</h2>
        <div id="leaderboard-list">
          <div class="loading">Loading...</div>
        </div>
        <button onclick="closeLeaderboard()">Close</button>
      </div>
    </div>
  `;

  // Append to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Show the leaderboard modal
 * @param {HighScoreAPI} scoreAPI - The initialized HighScoreAPI instance
 * @param {number} limit - Number of top scores to display (default: 10)
 */
async function showLeaderboard(scoreAPI, limit = 10) {
  const modal = document.getElementById('leaderboard-modal');
  const listDiv = document.getElementById('leaderboard-list');

  if (!modal || !listDiv) {
    console.error('Leaderboard modal not found. Call initLeaderboardModal() first.');
    return;
  }

  // Show modal with loading state
  modal.style.display = 'block';
  listDiv.innerHTML = '<div class="loading">Loading leaderboard...</div>';

  try {
    // Fetch leaderboard data
    const leaderboard = await scoreAPI.getLeaderboard(limit);

    if (leaderboard.length > 0) {
      // Build leaderboard HTML
      let html = '';
      leaderboard.forEach(entry => {
        const topClass = entry.rank === 1 ? 'top1' : entry.rank === 2 ? 'top2' : entry.rank === 3 ? 'top3' : '';
        const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';

        html += `
          <div class="leaderboard-entry ${topClass}">
            <span class="entry-rank">${medal} ${entry.rank}.</span>
            <span class="entry-name">${entry.player_name}</span>
            <span class="entry-score">${entry.score}</span>
          </div>
        `;
      });

      listDiv.innerHTML = html;
    } else {
      listDiv.innerHTML = '<div class="loading">No scores yet. Be the first!</div>';
    }
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    listDiv.innerHTML = '<div class="loading">Failed to load leaderboard. Please try again.</div>';
  }
}

/**
 * Close the leaderboard modal
 */
function closeLeaderboard() {
  const modal = document.getElementById('leaderboard-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Submit high score to the API
 * @param {HighScoreAPI} scoreAPI - The initialized HighScoreAPI instance
 * @param {number} score - The score to submit
 * @returns {Promise<Object>} - The result of the submission
 */
async function submitHighScore(scoreAPI, score) {
  if (score <= 0) {
    return { success: false, error: 'Invalid score' };
  }

  // Prompt for player name with score context
  const playerName = scoreAPI.promptForScoreSubmission(score);

  // Submit to API
  const result = await scoreAPI.submitScore(playerName, score);

  if (result.success) {
    console.log(`✅ Score submitted! Rank: ${result.rank}`);
    if (result.rank <= 10) {
      console.log(`🎉 You're in the top 10!`);
    }
  } else if (result.fallback) {
    console.log('⚠️ API unavailable, score saved locally');
  } else {
    console.log('❌ Score submission failed:', result.error);
  }

  return result;
}

/**
 * Add leaderboard button to game over screen
 * This creates a button that players can click to view the leaderboard (mobile-friendly)
 * @param {HTMLElement} container - The container to add the button to
 * @param {Function} callback - The function to call when button is clicked
 */
function addLeaderboardButton(container, callback) {
  const button = document.createElement('button');
  button.textContent = '🏆 View Leaderboard';
  button.className = 'leaderboard-button';
  button.onclick = callback;
  container.appendChild(button);
  return button;
}
