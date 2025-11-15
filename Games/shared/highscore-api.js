/**
 * High Score API Client
 * Reusable JavaScript module for all games
 *
 * USAGE:
 * ======
 * 1. Include in your game HTML:
 *    <script src="/Games/shared/highscore-api.js"></script>
 *
 * 2. Initialize in your game code:
 *    const scoreAPI = new HighScoreAPI('flappybork');
 *
 * 3. Submit a score:
 *    await scoreAPI.submitScore('PlayerName', 100);
 *
 * 4. Get leaderboard:
 *    const leaderboard = await scoreAPI.getLeaderboard(10);
 *
 * FEATURES:
 * =========
 * - Automatic fallback to localStorage if API is unavailable
 * - Browser fingerprinting for session tracking
 * - Player name persistence
 * - Simple integration with existing games
 */

class HighScoreAPI {
  /**
   * Initialize the API client
   * @param {string} gameSlug - The game identifier (e.g., 'flappybork')
   */
  constructor(gameSlug) {
    this.gameSlug = gameSlug;
    this.apiBase = '/api'; // Adjust if your API is hosted elsewhere
    this.sessionId = this.generateSessionId();
    this.fallbackKey = `${gameSlug}_highscore`;

    // Check if API is available
    this.checkAPIAvailability();
  }

  /**
   * Check if the API endpoints are accessible
   */
  async checkAPIAvailability() {
    try {
      const response = await fetch(`${this.apiBase}/get_leaderboard.php?game_slug=${this.gameSlug}&limit=1`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      this.apiAvailable = response.ok;
    } catch (error) {
      console.warn('API not available, will use localStorage fallback');
      this.apiAvailable = false;
    }
  }

  /**
   * Generate a fun anonymous name with alliteration
   * @returns {string} Random "Adjective Animal" pair
   */
  generateAnonymousName() {
    const adjectives = [
      // A
      'Adventurous', 'Adorable', 'Agile', 'Amazing', 'Ambitious', 'Amusing', 'Artistic', 'Astounding', 'Athletic', 'Awesome',
      // B
      'Beaming', 'Beautiful', 'Blissful', 'Bold', 'Bouncy', 'Brave', 'Bright', 'Brilliant', 'Bubbly', 'Busy',
      // C
      'Calm', 'Capable', 'Careful', 'Caring', 'Charming', 'Cheerful', 'Clever', 'Colorful', 'Courageous', 'Creative', 'Curious',
      // D
      'Dancing', 'Dapper', 'Daring', 'Dazzling', 'Delicate', 'Delightful', 'Determined', 'Diligent', 'Dynamic', 'Dashing',
      // E
      'Eager', 'Earnest', 'Easygoing', 'Ecstatic', 'Educated', 'Elegant', 'Enchanting', 'Energetic', 'Enthusiastic', 'Excellent', 'Excited', 'Exquisite',
      // F
      'Fabulous', 'Faithful', 'Famous', 'Fancy', 'Fantastic', 'Fearless', 'Feisty', 'Festive', 'Fierce', 'Friendly', 'Fun', 'Funny',
      // G
      'Gallant', 'Generous', 'Gentle', 'Genuine', 'Gifted', 'Giggling', 'Glorious', 'Glowing', 'Graceful', 'Gracious', 'Grand', 'Grateful', 'Great',
      // H
      'Happy', 'Harmonious', 'Helpful', 'Heroic', 'Honest', 'Hopeful', 'Humble', 'Humorous',
      // I
      'Imaginative', 'Incredible', 'Ingenious', 'Innocent', 'Inquisitive', 'Inspired', 'Intelligent', 'Inventive',
      // J
      'Jazzy', 'Jaunty', 'Jolly', 'Jovial', 'Joyful', 'Joyous', 'Jubilant', 'Jumping',
      // K
      'Keen', 'Kind', 'Kindhearted', 'Kingly', 'Knowledgeable',
      // L
      'Laughing', 'Legendary', 'Lively', 'Lovely', 'Loving', 'Loyal', 'Lucky', 'Luminous',
      // M
      'Magical', 'Magnificent', 'Majestic', 'Marvelous', 'Merry', 'Mighty', 'Miraculous', 'Mischievous', 'Musical', 'Mysterious',
      // N
      'Natural', 'Neat', 'Nice', 'Nimble', 'Noble', 'Noteworthy',
      // O
      'Observant', 'Optimistic', 'Opulent', 'Original', 'Outstanding',
      // P
      'Passionate', 'Patient', 'Peaceful', 'Perfect', 'Persistent', 'Playful', 'Pleasant', 'Polite', 'Popular', 'Positive', 'Powerful', 'Precious', 'Proud',
      // Q
      'Qualified', 'Queenly', 'Quick', 'Quiet', 'Quirky',
      // R
      'Radiant', 'Rapid', 'Rare', 'Rational', 'Ready', 'Reflective', 'Relaxed', 'Reliable', 'Remarkable', 'Resourceful', 'Respectful', 'Responsible',
      // S
      'Savvy', 'Sensational', 'Serene', 'Shining', 'Silly', 'Sincere', 'Skillful', 'Smart', 'Smiling', 'Smooth', 'Sociable', 'Spectacular', 'Spirited', 'Splendid', 'Spontaneous', 'Sporty', 'Stellar', 'Strong', 'Stunning', 'Super', 'Sweet', 'Swift',
      // T
      'Talented', 'Tender', 'Terrific', 'Thankful', 'Thoughtful', 'Thriving', 'Tidy', 'Timely', 'Tough', 'Tranquil', 'Trustworthy',
      // U
      'Unbeatable', 'Understanding', 'Unique', 'Upbeat', 'Uplifting',
      // V
      'Valiant', 'Valuable', 'Versatile', 'Vibrant', 'Victorious', 'Vigilant', 'Vigorous', 'Vivacious', 'Vivid',
      // W
      'Warm', 'Welcoming', 'Whimsical', 'Wholesome', 'Wild', 'Willing', 'Winning', 'Wise', 'Witty', 'Wonderful', 'Worthy',
      // Y
      'Youthful', 'Young',
      // Z
      'Zany', 'Zealous', 'Zesty', 'Zippy'
    ];

    const animals = [
      // A
      'Aardvark', 'Albatross', 'Alligator', 'Alpaca', 'Anaconda', 'Anchovy', 'Angelfish', 'Ant', 'Anteater', 'Antelope', 'Armadillo', 'Axolotl',
      // B
      'Baboon', 'Badger', 'Bandicoot', 'Barracuda', 'Basilisk', 'Bat', 'Bear', 'Beaver', 'Bee', 'Beetle', 'Bison', 'Bluebird', 'Bluejay', 'Butterfly', 'Bunny',
      // C
      'Camel', 'Canary', 'Capybara', 'Cardinal', 'Caribou', 'Cat', 'Caterpillar', 'Chameleon', 'Cheetah', 'Chickadee', 'Chicken', 'Chipmunk', 'Chinchilla', 'Clam', 'Cobra', 'Cockatoo', 'Cougar', 'Coyote', 'Crab', 'Crane', 'Cricket', 'Crocodile', 'Crow', 'Cuckoo',
      // D
      'Deer', 'Dingo', 'Dolphin', 'Donkey', 'Dove', 'Dragonfly', 'Duck', 'Dugong',
      // E
      'Eagle', 'Echidna', 'Eel', 'Egret', 'Elephant', 'Elk', 'Emu',
      // F
      'Falcon', 'Ferret', 'Finch', 'Firefly', 'Flamingo', 'Fox', 'Frog',
      // G
      'Gazelle', 'Gecko', 'Gerbil', 'Gibbon', 'Giraffe', 'Goat', 'Goldfish', 'Goose', 'Gopher', 'Gorilla', 'Grasshopper', 'Grebe', 'Grizzly', 'Groundhog', 'Grouse', 'Gull', 'Guppy',
      // H
      'Hamster', 'Hare', 'Hawk', 'Hedgehog', 'Heron', 'Hippo', 'Honeybee', 'Hornet', 'Horse', 'Hummingbird', 'Husky', 'Hyena',
      // I
      'Ibex', 'Ibis', 'Iguana', 'Impala',
      // J
      'Jackal', 'Jackrabbit', 'Jaguar', 'Jay', 'Jellyfish',
      // K
      'Kangaroo', 'Kestrel', 'Kingfisher', 'Kinkajou', 'Kite', 'Kiwi', 'Koala', 'Komodo', 'Kookaburra',
      // L
      'Ladybug', 'Lamb', 'Lark', 'Lemming', 'Lemur', 'Leopard', 'Lion', 'Lizard', 'Llama', 'Lobster', 'Loon', 'Lorikeet', 'Lynx',
      // M
      'Macaw', 'Magpie', 'Mallard', 'Manatee', 'Mandrill', 'Manta', 'Mantis', 'Marlin', 'Marmot', 'Meerkat', 'Mockingbird', 'Mole', 'Mongoose', 'Monkey', 'Moose', 'Moth', 'Mouse', 'Muskrat',
      // N
      'Narwhal', 'Newt', 'Nighthawk', 'Nightingale', 'Numbat', 'Nutria',
      // O
      'Ocelot', 'Octopus', 'Okapi', 'Opossum', 'Orangutan', 'Orca', 'Oriole', 'Osprey', 'Ostrich', 'Otter', 'Owl', 'Ox', 'Oyster',
      // P
      'Panda', 'Panther', 'Parakeet', 'Parrot', 'Peacock', 'Pelican', 'Penguin', 'Perch', 'Peregrine', 'Pheasant', 'Pig', 'Pigeon', 'Pike', 'Platypus', 'Plover', 'Polar', 'Porcupine', 'Porpoise', 'Possum', 'Prairie', 'Puffin', 'Puma', 'Python',
      // Q
      'Quail', 'Quetzal', 'Quokka',
      // R
      'Rabbit', 'Raccoon', 'Raven', 'Ray', 'Reindeer', 'Rhino', 'Robin', 'Rooster',
      // S
      'Salamander', 'Salmon', 'Sandpiper', 'Sardine', 'Scorpion', 'Seahorse', 'Seal', 'Shark', 'Sheep', 'Shrew', 'Shrimp', 'Skink', 'Skunk', 'Sloth', 'Snail', 'Snake', 'Sparrow', 'Spider', 'Squid', 'Squirrel', 'Starfish', 'Starling', 'Stingray', 'Stoat', 'Stork', 'Swallow', 'Swan', 'Swift',
      // T
      'Tadpole', 'Tapir', 'Tarantula', 'Tarsier', 'Tiger', 'Toad', 'Tortoise', 'Toucan', 'Trout', 'Turkey', 'Turtle',
      // U
      'Unicorn', 'Urchin',
      // V
      'Viper', 'Vole', 'Vulture',
      // W
      'Wallaby', 'Walrus', 'Wasp', 'Weasel', 'Whale', 'Whippet', 'Wildcat', 'Wolf', 'Wolverine', 'Wombat', 'Woodpecker', 'Worm', 'Wren',
      // X
      'Xerus',
      // Y
      'Yak', 'Yellowjacket',
      // Z
      'Zebra', 'Zebu', 'Zorilla'
    ];

    // Find matching alliterations
    const alliterations = [];
    adjectives.forEach(adj => {
      animals.forEach(animal => {
        if (adj[0] === animal[0]) {
          alliterations.push(`${adj} ${animal}`);
        }
      });
    });

    // Random selection
    const randomIndex = Math.floor(Math.random() * alliterations.length);
    return alliterations[randomIndex];
  }

  /**
   * Generate a simple browser fingerprint for session tracking
   * @returns {string} Session ID hash
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
   *
   * @param {string} playerName - Player's name
   * @param {number} score - The score to submit
   * @returns {Promise<Object>} Response object with success status and rank
   */
  async submitScore(playerName, score) {
    // Validate inputs
    if (!playerName || playerName.trim().length < 2) {
      return {
        success: false,
        error: 'Player name must be at least 2 characters'
      };
    }

    if (typeof score !== 'number' || score < 0) {
      return {
        success: false,
        error: 'Score must be a positive number'
      };
    }

    try {
      const response = await fetch(`${this.apiBase}/submit_score.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_slug: this.gameSlug,
          player_name: playerName.trim(),
          score: score,
          session_id: this.sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Warn user if their name was sanitized
      if (data.name_sanitized) {
        console.warn('⚠️ Your name contained inappropriate content and was filtered.');
        console.log(`Original attempt censored → Final name: "${data.player_name}"`);
      }

      // Also save to localStorage as backup
      this.saveLocalScore(playerName, score);

      return data;

    } catch (error) {
      console.warn('API submission failed, using localStorage:', error);
      this.saveLocalScore(playerName, score);
      return {
        success: false,
        fallback: true,
        error: error.message
      };
    }
  }

  /**
   * Get leaderboard from API
   * Falls back to localStorage if API fails
   *
   * @param {number} limit - Number of scores to retrieve (default: 10)
   * @returns {Promise<Array>} Array of score objects
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
   * Save score to localStorage (fallback method)
   * @param {string} playerName - Player's name
   * @param {number} score - The score
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
   * @returns {Object} Score object
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
   * @returns {Array} Array with one score entry
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
   * Prompt user for name with validation
   * @param {boolean} allowCancel - If true, returns null on cancel. If false, returns random name
   * @returns {string|null} Player name or null/random name
   */
  promptForPlayerName(allowCancel = false) {
    const stored = localStorage.getItem('player_name');
    const randomName = this.generateAnonymousName();
    const message = stored
      ? `Enter name for leaderboard (previously: ${stored}):\n(Leave blank or cancel for: "${randomName}")`
      : `Enter your name for the leaderboard:\n(Leave blank or cancel for: "${randomName}")`;

    let name = prompt(message, stored || '');

    // If user cancels or leaves blank, use random fun name
    if (name === null || name.trim() === '') {
      return allowCancel ? null : randomName;
    }

    // Sanitize: only alphanumeric and spaces
    name = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    name = name.substring(0, 50);

    if (name.length >= 2) {
      // Save as last used name (for convenience, not permanence)
      localStorage.setItem('player_name', name);
      return name;
    }

    // If too short after sanitization, use random name
    return allowCancel ? null : randomName;
  }

  /**
   * Prompt for name with score context
   * @param {number} score - The score they achieved
   * @returns {string} Player name (never null, defaults to random fun name)
   */
  promptForScoreSubmission(score) {
    const stored = localStorage.getItem('player_name');
    const randomName = this.generateAnonymousName();
    const message = stored
      ? `🎮 Score: ${score}\n\nEnter name for global leaderboard:\n(Press OK to use "${stored}" or change it below)\n(Cancel = "${randomName}")`
      : `🎮 Score: ${score}\n\nEnter your name for the global leaderboard:\n(Not stored permanently - just for this score)\n(Cancel = "${randomName}")`;

    let name = prompt(message, stored || '');

    // Handle cancel or blank - use fun random name
    if (name === null || name.trim() === '') {
      return randomName;
    }

    // Sanitize
    name = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    name = name.substring(0, 50);

    if (name.length >= 2) {
      // Remember for next time (convenience only)
      localStorage.setItem('player_name', name);
      return name;
    }

    return randomName;
  }

  /**
   * Get stored player name
   * @returns {string|null}
   */
  getStoredPlayerName() {
    return localStorage.getItem('player_name');
  }

  /**
   * Clear stored player name
   */
  clearStoredPlayerName() {
    localStorage.removeItem('player_name');
  }
}
