# Content Moderation & Privacy Features

**Version:** 1.1
**Date:** November 2025
**Status:** ✅ Implemented & Tested

---

## Overview

The high-score system includes comprehensive content moderation and privacy-friendly features to ensure family-friendly leaderboards while supporting multiple players per device.

---

## 🎉 Fun Anonymous Names

### What It Is
Instead of boring "Anonymous" labels, players who skip entering a name get fun, alliterative animal names like Ubuntu distributions.

### Examples
- Opulent Ocelot
- Fantastic Fox
- Brave Badger
- Clever Chinchilla
- Mighty Meerkat
- Radiant Raccoon
- Swift Sloth
- Zealous Zebra
- Adventurous Aardvark
- Brilliant Butterfly
- Dazzling Dragonfly
- Enchanting Eagle
- Graceful Gazelle
- Magical Mongoose
- Spectacular Squirrel
- Wonderful Whale

### How It Works
```javascript
// In highscore-api.js
generateAnonymousName() {
  // 220+ adjectives × 264+ animals = ~2860 alliterative combinations!
  // Returns random alliterative pair
  // Examples: "Adorable Albatross", "Keen Koala", "Charming Chameleon", etc.
}
```

### Benefits
✅ **Engaging** - Makes anonymous play fun
✅ **Privacy-friendly** - No pressure to provide real name
✅ **Multi-player** - Each session gets fresh name
✅ **Memorable** - Easier to track your score than "Anonymous #47"
✅ **Educational** - Kids learn animal names

### Player Experience

**First time player:**
```
🎮 Score: 42

Enter your name for the global leaderboard:
(Not stored permanently - just for this score)
(Cancel = "Quirky Quokka")

[           ]
```

**Returning player:**
```
🎮 Score: 55

Enter name for global leaderboard:
(Press OK to use "Alice" or change it below)
(Cancel = "Brave Badger")

[Alice]
```

**If they click Cancel or leave blank:**
→ Their score appears as "Quirky Quokka" (or whatever was randomly generated)

---

## 🛡️ Content Filtering System

### API-Level Protection

All filtering happens **server-side** in PHP, so it:
- ✅ Cannot be bypassed by modifying client code
- ✅ Applies to ALL games automatically
- ✅ Works even if JavaScript is disabled
- ✅ Provides consistent moderation

### What Gets Filtered

#### 1. Profanity & Vulgar Language (40+ terms)
Common curse words and inappropriate language

#### 2. Racist & Discriminatory Terms (25+ terms)
Slurs, hate speech, and discriminatory language

#### 3. Sexual & Explicit Content (20+ terms)
Inappropriate sexual references

#### 4. Variations & Bypasses
- **Leetspeak**: a$$, sh!t, f@ck, etc.
- **Separators**: f.u.c.k, s-h-i-t, a_s_s
- **Case mixing**: AsS, sHiT, FuCk
- **Numbers**: a55, 5hit, fuc6

### How It Works

```php
// content_filter.php
class ContentFilter {
    // 1. Normalize text (convert leetspeak, remove separators)
    // 2. Check against word lists
    // 3. Auto-sanitize with asterisks
    // 4. Reject if >50% censored
}
```

### Examples

| Input | Output | Action |
|-------|--------|--------|
| `Alice` | `Alice` | ✅ Pass through |
| `Fantastic Fox` | `Fantastic Fox` | ✅ Pass through |
| `test123` | `test123` | ✅ Pass through |
| `class` | `class` | ✅ Pass (no false positive) |
| `grass` | `grass` | ✅ Pass (no false positive) |
| `assistant` | `assistant` | ✅ Pass (no false positive) |
| *(inappropriate)* | `***` | ⚠️ Sanitize |
| *(mostly bad)* | **REJECTED** | ❌ Too censored |

### Smart Features

#### 1. **Word Boundaries**
Prevents false positives:
- "class" ✅ allowed (contains "ass" but not as whole word)
- "grass" ✅ allowed
- "assistant" ✅ allowed

#### 2. **Context-Aware**
```php
// Catches whole words
"ass"      → *** (censored)

// But allows partial matches in legitimate words
"class"    → class (allowed)
"compass"  → compass (allowed)
```

#### 3. **Auto-Sanitization**
```
Input:  "bad_word123"
Output: "***_***123"  (word replaced with asterisks)
```

#### 4. **Rejection Threshold**
If >50% of the name becomes asterisks, reject it entirely:
```
Input:  "badword"
After:  "********"
Result: REJECTED - "Please choose a different name"
```

---

## 🔒 Privacy Features

### 1. **Prompt Every Time**
Players are asked for their name on **every** score submission (not just once).

**Why?**
- No implied data permanence
- Multiple players can share one device
- Clear that it's just for this leaderboard entry

### 2. **Convenience Remembering**
The last-used name is shown as a **default suggestion**, but can be changed.

**What's stored in localStorage:**
```javascript
{
  "player_name": "Alice"  // Last used name only (for convenience)
}
```

**What's NOT stored:**
- No permanent association
- No player ID or tracking
- No history of names used

### 3. **Easy Anonymous Play**
- Click "Cancel" → Get fun random name
- Leave blank → Get fun random name
- No pressure to provide real name

---

## 🧪 Testing the Filter

Run the test script:

```bash
php /api/test_filter.php
```

**Output:**
```
=== Content Filter Test ===

CLEAN NAMES (should all pass):
------------------------------------------------------------
Alice                → ✓ PASS → Alice
Bob123              → ✓ PASS → Bob123
Opulent Ocelot      → ✓ PASS → Opulent Ocelot
Fantastic Fox       → ✓ PASS → Fantastic Fox
class               → ✓ PASS → class
grass               → ✓ PASS → grass
assistant           → ✓ PASS → assistant

INAPPROPRIATE NAMES (should be filtered):
------------------------------------------------------------
(Examples omitted for documentation)

FILTER STATISTICS:
------------------------------------------------------------
Profanity terms: 40
Racist terms: 25
Sexual terms: 20
Total filtered terms: 85

PROTECTION FEATURES:
------------------------------------------------------------
✓ Case-insensitive matching
✓ Leetspeak detection (4=a, 3=e, $=s, etc.)
✓ Separator bypassing (catches f.u.c.k, s-h-i-t)
✓ Partial word matching (catches variations)
✓ Word boundary detection (prevents false positives)
✓ Auto-sanitization with asterisks
✓ Rejection if mostly censored (>50% asterisks)
```

---

## 📊 API Response Examples

### Success (Clean Name)
```json
{
  "success": true,
  "score_id": 123,
  "rank": 5,
  "player_name": "Alice",
  "message": "Score submitted successfully"
}
```

### Success (Sanitized Name)
```json
{
  "success": true,
  "score_id": 124,
  "rank": 8,
  "player_name": "*** Player",
  "name_sanitized": true,
  "message": "Score submitted successfully (Note: inappropriate content was filtered from your name)"
}
```

### Rejection (Too Censored)
```json
{
  "error": "Inappropriate player name",
  "message": "Please choose a different name. Inappropriate content is not allowed."
}
```

---

## 🎮 Player Experience Flow

### Scenario 1: Clean Name
1. Player scores 100 points
2. Prompt appears: "Enter name for global leaderboard"
3. Player types "Alice"
4. ✅ Name accepted
5. Score appears as "Alice: 100"

### Scenario 2: Anonymous (Fun Name)
1. Player scores 50 points
2. Prompt appears showing "Cancel = Brave Badger"
3. Player clicks Cancel
4. ✅ Score appears as "Brave Badger: 50"

### Scenario 3: Inappropriate Name
1. Player scores 75 points
2. Prompt appears
3. Player types inappropriate word
4. ⚠️ API sanitizes: "*** ******"
5. Score appears with asterisks
6. Console shows: "Your name was filtered"

### Scenario 4: Mostly Inappropriate
1. Player scores 90 points
2. Player tries to use very inappropriate name
3. ❌ API rejects: ">50% would be asterisks"
4. Error message: "Please choose a different name"
5. Player must try again with different name

---

## 🔧 Maintenance & Updates

### Adding New Filtered Terms

Edit `/api/content_filter.php`:

```php
private static $profanity = [
    'existing', 'terms', 'here',
    'new_term_to_filter'  // Add new terms here
];
```

### Adjusting Rejection Threshold

Edit `/api/submit_score.php`:

```php
// Current: 50% asterisks = reject
$asteriskRatio = substr_count($player_name, '*') / max(strlen($player_name), 1);
if ($asteriskRatio > 0.5) {  // Change this value (0.0 to 1.0)
    // Reject
}
```

### Adding More Fun Animals

Edit `/Games/shared/highscore-api.js`:

```javascript
const animals = [
    'Albatross', 'Badger', 'Chinchilla',
    'YourNewAnimal'  // Add here
];

const adjectives = [
    'Adorable', 'Brave', 'Clever',
    'YourNewAdjective'  // Add here
];
```

---

## 📈 Statistics

**Filter Coverage:**
- 85+ inappropriate terms blocked
- Hundreds of variations caught (leetspeak, separators)
- Zero false positives in testing (class, grass, etc. allowed)

**Fun Names:**
- 220+ adjectives
- 264+ animals
- ~2860 alliterative combinations
- Fresh random selection each time
- Virtually infinite variety for players

**Privacy:**
- Zero permanent data storage
- Only last-used name cached (convenience)
- Can be cleared anytime
- No tracking or analytics

---

## ✅ Compliance & Best Practices

### COPPA Compliance
- No personal data collection
- No persistent user accounts
- Optional name entry (anonymous allowed)
- Clear what data is used for

### Community Standards
- Family-friendly leaderboards
- Prevents harassment
- Blocks hate speech
- Professional moderation

### Technical Best Practices
- Server-side validation (secure)
- Cannot be bypassed
- Comprehensive coverage
- Easy to update/maintain

---

## 🚀 Future Enhancements

Possible additions:
1. **Admin Dashboard** - View/moderate flagged names
2. **Player Reporting** - Let users report inappropriate names
3. **Custom Word Lists** - Per-game custom filtering
4. **Language Detection** - Multi-language support
5. **More Animal Themes** - Seasonal variations (e.g., ocean animals in summer)

---

**Questions or Issues?**

See `/api/README.md` for troubleshooting and setup instructions.

---

**Version History:**
- **v1.0** - Initial high-score system
- **v1.1** - Added content filtering and fun anonymous names
