import { RELATED_WORDS_MAP, MOOD_WHEEL } from "../constants";

/**
 * Find official wheel moods related to user input
 * @param {string} userInput - The feeling word the user typed
 * @param {Array} currentMoods - Currently selected moods to avoid duplicates
 * @returns {Object} - Match results with suggestions
 */
export const findRelatedMoods = (userInput, currentMoods = []) => {
  if (!userInput || !userInput.trim()) {
    return { exactMatch: null, suggestions: [] };
  }

  const normalized = userInput.toLowerCase().trim();

  // Check if it's an exact match to a tertiary mood (case-insensitive)
  const exactMatch = Object.keys(RELATED_WORDS_MAP).find(
    (mood) => mood.toLowerCase() === normalized
  );

  if (exactMatch && !currentMoods.includes(exactMatch)) {
    return {
      exactMatch,
      suggestions: [],
      userCanAddCustom: false,
    };
  }

  // Search through all moods for variants/synonyms/related
  const matches = [];

  Object.entries(RELATED_WORDS_MAP).forEach(([officialMood, mappings]) => {
    // Skip if already selected
    if (currentMoods.includes(officialMood)) return;

    const { variants, synonyms, related } = mappings;

    // Check variants (highest priority)
    if (variants.some((v) => v.toLowerCase() === normalized)) {
      matches.push({
        mood: officialMood,
        matchType: "variant",
        priority: 1,
      });
    }
    // Check synonyms (medium priority)
    else if (synonyms.some((s) => s.toLowerCase() === normalized)) {
      matches.push({
        mood: officialMood,
        matchType: "synonym",
        priority: 2,
      });
    }
    // Check related (lower priority)
    else if (related.some((r) => r.toLowerCase() === normalized)) {
      matches.push({
        mood: officialMood,
        matchType: "related",
        priority: 3,
      });
    }
  });

  // Sort by priority and return top 5
  const sortedMatches = matches
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map((m) => m.mood);

  return {
    exactMatch: null,
    suggestions: sortedMatches,
    userCanAddCustom: sortedMatches.length === 0 || normalized.length > 0,
  };
};

/**
 * Check if a word is in the official mood wheel
 * @param {string} word
 * @returns {boolean}
 */
export const isOfficialMood = (word) => {
  return Object.keys(RELATED_WORDS_MAP).some(
    (mood) => mood.toLowerCase() === word.toLowerCase()
  );
};

/**
 * Get all moods at a specific tier
 * @param {number} tier - 1, 2, or 3
 * @returns {Array} - Array of mood names
 */
export const getMoodsByTier = (tier) => {
  if (tier === 1) {
    return Object.keys(MOOD_WHEEL);
  }

  if (tier === 2) {
    const secondaryMoods = [];
    Object.values(MOOD_WHEEL).forEach((secondary) => {
      secondaryMoods.push(...Object.keys(secondary));
    });
    return secondaryMoods;
  }

  if (tier === 3) {
    return Object.keys(RELATED_WORDS_MAP);
  }

  return [];
};

/**
 * Get the parent moods for a given mood
 * @param {string} mood - The mood to look up
 * @returns {Object} - { primary, secondary, tertiary }
 */
export const getMoodHierarchy = (mood) => {
  for (const [primary, secondaryObj] of Object.entries(MOOD_WHEEL)) {
    for (const [secondary, tertiaryArray] of Object.entries(secondaryObj)) {
      if (tertiaryArray.includes(mood)) {
        return { primary, secondary, tertiary: mood };
      }
      if (secondary === mood) {
        return { primary, secondary, tertiary: null };
      }
    }
    if (primary === mood) {
      return { primary, secondary: null, tertiary: null };
    }
  }
  return { primary: null, secondary: null, tertiary: null };
};

export default {
  findRelatedMoods,
  isOfficialMood,
  getMoodsByTier,
  getMoodHierarchy,
};
