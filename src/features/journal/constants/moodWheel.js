/**
 * Official Mood Wheel - 3 Tier Structure
 * Tier 1: Primary emotions (7 core categories)
 * Tier 2: Secondary emotions (subcategories)
 * Tier 3: Tertiary emotions (specific feelings)
 */

export const MOOD_WHEEL = {
  Happy: {
    Playful: ["Cheeky", "Aroused"],
    Content: ["Joyful", "Free"],
    Interested: ["Inquisitive", "Curious"],
    Proud: ["Confident", "Successful"],
    Accepted: ["Valued", "Respected"],
    Powerful: ["Creative", "Courageous"],
    Peaceful: ["Thankful", "Loving"],
    Trusting: ["Intimate", "Sensitive"],
    Optimistic: ["Inspired", "Hopeful"],
  },
  Sad: {
    Lonely: ["Isolated", "Abandoned"],
    Vulnerable: ["Victimized", "Fragile"],
    Despair: ["Grief", "Powerless"],
    Guilty: ["Ashamed", "Remorseful"],
    Depressed: ["Inferior", "Empty"],
    Hurt: ["Disappointed", "Embarrassed"],
  },
  Disgusted: {
    Repelled: ["Horrified", "Hesitant"],
    Disapproving: ["Judgmental", "Embarrassed"],
    Awful: ["Nauseated", "Detestable"],
    Disappointed: ["Appalled", "Revolted"],
  },
  Angry: {
    Critical: ["Skeptical", "Dismissive"],
    Distant: ["Withdrawn", "Numb"],
    Frustrated: ["Infuriated", "Annoyed"],
    Aggressive: ["Provoked", "Hostile"],
    Mad: ["Furious", "Jealous"],
    Bitter: ["Indignant", "Violated"],
    Humiliated: ["Disrespected", "Ridiculed"],
    "Let down": ["Betrayed", "Resentful"],
  },
  Fearful: {
    Threatened: ["Nervous", "Exposed"],
    Rejected: ["Excluded", "Persecuted"],
    Weak: ["Worthless", "Insignificant"],
    Insecure: ["Inadequate", "Inferior"],
    Anxious: ["Overwhelmed", "Worried"],
    Scared: ["Helpless", "Frightened"],
  },
  Bad: {
    Bored: ["Indifferent", "Apathetic"],
    Busy: ["Pressured", "Rushed"],
    Stressed: ["Overwhelmed", "Out of Control"],
    Tired: ["Sleepy", "Unfocused"],
  },
  Surprised: {
    Startled: ["Shocked", "Dismayed"],
    Confused: ["Disillusioned", "Perplexed"],
    Amazed: ["Astonished", "Awe"],
    Excited: ["Eager", "Energetic"],
  },
};

export default MOOD_WHEEL;
