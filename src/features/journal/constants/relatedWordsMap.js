// relatedWordsMap.js

/**
 * Maps user input (variants, synonyms, related words) to official mood wheel terms
 * Structure: Each tertiary mood has variants, synonyms, and related words
 */

const RELATED_WORDS_MAP = {
  // ============================================
  // HAPPY BRANCH
  // ============================================

  // Playful → Cheeky
  Cheeky: {
    variants: ["cheek", "cheekily", "cheekiness"],
    synonyms: [
      "impudent",
      "impertinent",
      "sassy",
      "bold",
      "brazen",
      "audacious",
    ],
    related: ["playful", "mischievous", "teasing", "irreverent", "fresh"],
  },

  // Playful → Aroused
  Aroused: {
    variants: ["arouse", "arousal", "arousing"],
    synonyms: ["stimulated", "excited", "awakened", "stirred", "activated"],
    related: [
      "energized",
      "invigorated",
      "passionate",
      "turned on",
      "electrified",
    ],
  },

  // Content → Joyful
  Joyful: {
    variants: ["joy", "joyfully", "joyfulness"],
    synonyms: [
      "delighted",
      "elated",
      "jubilant",
      "ecstatic",
      "gleeful",
      "overjoyed",
    ],
    related: [
      "happy",
      "cheerful",
      "uplifted",
      "thrilled",
      "radiant",
      "blissful",
    ],
  },

  // Content → Free
  Free: {
    variants: ["freedom", "freely", "freeing", "freed"],
    synonyms: [
      "liberated",
      "unrestrained",
      "unrestricted",
      "independent",
      "autonomous",
    ],
    related: [
      "unburdened",
      "carefree",
      "emancipated",
      "uninhibited",
      "released",
    ],
  },

  // Interested → Inquisitive
  Inquisitive: {
    variants: ["inquire", "inquiry", "inquisitiveness", "inquiring"],
    synonyms: [
      "curious",
      "questioning",
      "probing",
      "investigative",
      "analytical",
    ],
    related: ["searching", "exploring", "wondering", "nosy", "prying"],
  },

  // Interested → Curious
  Curious: {
    variants: ["curiosity", "curiously"],
    synonyms: [
      "inquisitive",
      "interested",
      "intrigued",
      "questioning",
      "inquiring",
    ],
    related: [
      "wondering",
      "fascinated",
      "attentive",
      "engaged",
      "eager to learn",
    ],
  },

  // Proud → Confident
  Confident: {
    variants: ["confidence", "confidently"],
    synonyms: [
      "self-assured",
      "assured",
      "certain",
      "secure",
      "poised",
      "self-confident",
    ],
    related: [
      "bold",
      "determined",
      "resolute",
      "empowered",
      "strong",
      "capable",
    ],
  },

  // Proud → Successful
  Successful: {
    variants: ["success", "successfully", "succeed"],
    synonyms: [
      "accomplished",
      "triumphant",
      "victorious",
      "achieving",
      "winning",
    ],
    related: ["thriving", "prosperous", "effective", "fulfilled", "on top"],
  },

  // Accepted → Valued
  Valued: {
    variants: ["value", "valuing", "valuable"],
    synonyms: [
      "appreciated",
      "esteemed",
      "treasured",
      "cherished",
      "prized",
      "worthy",
    ],
    related: [
      "respected",
      "honored",
      "recognized",
      "acknowledged",
      "important",
    ],
  },

  // Accepted → Respected
  Respected: {
    variants: ["respect", "respecting", "respectful"],
    synonyms: [
      "esteemed",
      "honored",
      "admired",
      "revered",
      "regarded",
      "venerated",
    ],
    related: [
      "valued",
      "appreciated",
      "dignified",
      "recognized",
      "looked up to",
    ],
  },

  // Powerful → Creative
  Creative: {
    variants: ["create", "creativity", "creatively", "creation", "creating"],
    synonyms: [
      "inventive",
      "imaginative",
      "innovative",
      "original",
      "artistic",
      "ingenious",
    ],
    related: ["inspired", "expressive", "resourceful", "visionary", "crafty"],
  },

  // Powerful → Courageous
  Courageous: {
    variants: ["courage", "courageously"],
    synonyms: [
      "brave",
      "bold",
      "fearless",
      "valiant",
      "heroic",
      "daring",
      "gallant",
    ],
    related: [
      "strong",
      "determined",
      "resolute",
      "intrepid",
      "gutsy",
      "lionhearted",
    ],
  },

  // Peaceful → Thankful
  Thankful: {
    variants: ["thanks", "thankfulness", "thank", "thanking"],
    synonyms: ["grateful", "appreciative", "obliged", "indebted", "beholden"],
    related: ["blessed", "fortunate", "content", "gracious", "appreciating"],
  },

  // Peaceful → Loving
  Loving: {
    variants: ["love", "lovingly", "loved", "loves"],
    synonyms: [
      "affectionate",
      "caring",
      "tender",
      "devoted",
      "adoring",
      "fond",
    ],
    related: ["warm", "compassionate", "nurturing", "kind", "doting", "sweet"],
  },

  // Trusting → Intimate
  Intimate: {
    variants: ["intimacy", "intimately"],
    synonyms: [
      "close",
      "personal",
      "private",
      "familiar",
      "confidential",
      "deep",
    ],
    related: [
      "connected",
      "bonded",
      "vulnerable",
      "open",
      "near",
      "tight-knit",
    ],
  },

  // Trusting → Sensitive
  Sensitive: {
    variants: ["sensitivity", "sensitively", "sensitize"],
    synonyms: [
      "responsive",
      "aware",
      "perceptive",
      "attuned",
      "receptive",
      "intuitive",
    ],
    related: [
      "empathetic",
      "understanding",
      "compassionate",
      "delicate",
      "tender",
    ],
  },

  // Optimistic → Inspired
  Inspired: {
    variants: ["inspire", "inspiration", "inspiring", "inspirational"],
    synonyms: [
      "motivated",
      "stimulated",
      "moved",
      "influenced",
      "encouraged",
      "galvanized",
    ],
    related: [
      "uplifted",
      "energized",
      "passionate",
      "driven",
      "fired up",
      "animated",
    ],
  },

  // Optimistic → Hopeful
  Hopeful: {
    variants: ["hope", "hopefully", "hopefulness", "hoping"],
    synonyms: ["optimistic", "positive", "expectant", "confident", "sanguine"],
    related: [
      "encouraged",
      "promising",
      "bright",
      "anticipating",
      "looking forward",
    ],
  },

  // ============================================
  // SAD BRANCH
  // ============================================

  // Lonely → Isolated
  Isolated: {
    variants: ["isolate", "isolation", "isolating"],
    synonyms: [
      "alone",
      "solitary",
      "separated",
      "secluded",
      "cut off",
      "segregated",
    ],
    related: [
      "lonely",
      "disconnected",
      "excluded",
      "remote",
      "stranded",
      "apart",
    ],
  },

  // Lonely → Abandoned
  Abandoned: {
    variants: ["abandon", "abandonment", "abandoning"],
    synonyms: [
      "deserted",
      "forsaken",
      "left",
      "rejected",
      "discarded",
      "jilted",
    ],
    related: [
      "alone",
      "neglected",
      "unwanted",
      "cast aside",
      "thrown away",
      "ditched",
    ],
  },

  // Vulnerable → Victimized
  Victimized: {
    variants: ["victim", "victimize", "victimization"],
    synonyms: [
      "exploited",
      "abused",
      "wronged",
      "harmed",
      "persecuted",
      "mistreated",
    ],
    related: ["targeted", "oppressed", "hurt", "taken advantage of", "used"],
  },

  // Vulnerable → Fragile
  Fragile: {
    variants: ["fragility"],
    synonyms: ["delicate", "weak", "brittle", "breakable", "frail", "dainty"],
    related: [
      "vulnerable",
      "sensitive",
      "unstable",
      "tender",
      "shaky",
      "precarious",
    ],
  },

  // Despair → Grief
  Grief: {
    variants: ["grieve", "grieving", "grieved"],
    synonyms: [
      "sorrow",
      "mourning",
      "anguish",
      "heartache",
      "sadness",
      "heartbreak",
    ],
    related: [
      "loss",
      "devastation",
      "bereavement",
      "misery",
      "woe",
      "lamentation",
    ],
  },

  // Despair → Powerless
  Powerless: {
    variants: ["powerlessness"],
    synonyms: [
      "helpless",
      "impotent",
      "ineffective",
      "weak",
      "defenseless",
      "unable",
    ],
    related: [
      "hopeless",
      "incapable",
      "trapped",
      "stuck",
      "paralyzed",
      "useless",
    ],
  },

  // Guilty → Ashamed
  Ashamed: {
    variants: ["shame", "shameful", "shaming", "shamed"],
    synonyms: [
      "embarrassed",
      "humiliated",
      "mortified",
      "disgraced",
      "dishonored",
    ],
    related: [
      "guilty",
      "regretful",
      "remorseful",
      "sheepish",
      "chagrined",
      "abashed",
    ],
  },

  // Guilty → Remorseful
  Remorseful: {
    variants: ["remorse", "remorsefully"],
    synonyms: [
      "regretful",
      "sorry",
      "contrite",
      "penitent",
      "repentant",
      "apologetic",
    ],
    related: [
      "guilty",
      "rueful",
      "conscience-stricken",
      "ashamed",
      "sorrowful",
    ],
  },

  // Depressed → Inferior
  Inferior: {
    variants: ["inferiority"],
    synonyms: [
      "lesser",
      "subordinate",
      "inadequate",
      "substandard",
      "second-rate",
      "lower",
    ],
    related: [
      "worthless",
      "insufficient",
      "deficient",
      "incompetent",
      "subpar",
      "mediocre",
    ],
  },

  // Depressed → Empty
  Empty: {
    variants: ["emptiness", "emptying", "emptied"],
    synonyms: ["hollow", "vacant", "void", "barren", "blank", "devoid"],
    related: [
      "numb",
      "lifeless",
      "meaningless",
      "depleted",
      "drained",
      "vacuous",
    ],
  },

  // Hurt → Disappointed
  Disappointed: {
    variants: ["disappoint", "disappointment", "disappointing"],
    synonyms: [
      "let down",
      "disheartened",
      "dismayed",
      "dissatisfied",
      "discouraged",
    ],
    related: [
      "upset",
      "saddened",
      "deflated",
      "crestfallen",
      "bummed",
      "frustrated",
    ],
  },

  // Hurt → Embarrassed
  Embarrassed: {
    variants: ["embarrass", "embarrassment", "embarrassing"],
    synonyms: [
      "ashamed",
      "humiliated",
      "self-conscious",
      "uncomfortable",
      "awkward",
    ],
    related: ["sheepish", "flustered", "mortified", "red-faced", "chagrined"],
  },

  // ============================================
  // DISGUSTED BRANCH
  // ============================================

  // Repelled → Horrified
  Horrified: {
    variants: ["horrify", "horror", "horrifying"],
    synonyms: [
      "appalled",
      "shocked",
      "aghast",
      "dismayed",
      "outraged",
      "scandalized",
    ],
    related: ["disgusted", "revolted", "disturbed", "traumatized", "sickened"],
  },

  // Repelled → Hesitant
  Hesitant: {
    variants: ["hesitate", "hesitation", "hesitating"],
    synonyms: [
      "uncertain",
      "reluctant",
      "unsure",
      "doubtful",
      "tentative",
      "wavering",
    ],
    related: ["cautious", "wary", "apprehensive", "indecisive", "hesitating"],
  },

  // Disapproving → Judgmental
  Judgmental: {
    variants: ["judge", "judgment", "judging"],
    synonyms: [
      "critical",
      "condemning",
      "censorious",
      "disapproving",
      "fault-finding",
    ],
    related: [
      "harsh",
      "opinionated",
      "prejudiced",
      "holier-than-thou",
      "self-righteous",
    ],
  },

  // Awful → Nauseated
  Nauseated: {
    variants: ["nausea", "nauseous", "nauseating"],
    synonyms: ["sick", "queasy", "disgusted", "revolted", "ill"],
    related: ["repulsed", "turned off", "grossed out", "sickened", "squeamish"],
  },

  // Awful → Detestable
  Detestable: {
    variants: ["detest", "detestation", "detesting"],
    synonyms: [
      "hateful",
      "abhorrent",
      "loathsome",
      "repugnant",
      "vile",
      "despicable",
    ],
    related: [
      "disgusting",
      "revolting",
      "odious",
      "contemptible",
      "abominable",
    ],
  },

  // Disappointed → Appalled
  Appalled: {
    variants: ["appall", "appalling"],
    synonyms: ["horrified", "shocked", "dismayed", "outraged", "scandalized"],
    related: ["disgusted", "offended", "aghast", "dumbfounded", "stunned"],
  },

  // Disappointed → Revolted
  Revolted: {
    variants: ["revolt", "revolting"],
    synonyms: ["disgusted", "repulsed", "sickened", "nauseated", "repelled"],
    related: ["offended", "turned off", "grossed out", "horrified"],
  },

  // ============================================
  // ANGRY BRANCH
  // ============================================

  // Critical → Skeptical
  Skeptical: {
    variants: ["skeptic", "skepticism"],
    synonyms: [
      "doubtful",
      "dubious",
      "cynical",
      "questioning",
      "suspicious",
      "mistrustful",
    ],
    related: [
      "distrustful",
      "uncertain",
      "wary",
      "unconvinced",
      "disbelieving",
    ],
  },

  // Critical → Dismissive
  Dismissive: {
    variants: ["dismiss", "dismissal", "dismissing"],
    synonyms: [
      "contemptuous",
      "disdainful",
      "scornful",
      "condescending",
      "patronizing",
    ],
    related: [
      "disrespectful",
      "belittling",
      "rejecting",
      "ignoring",
      "flippant",
    ],
  },

  // Distant → Withdrawn
  Withdrawn: {
    variants: ["withdraw", "withdrawal", "withdrawing"],
    synonyms: [
      "detached",
      "aloof",
      "remote",
      "isolated",
      "reclusive",
      "introverted",
    ],
    related: [
      "distant",
      "reserved",
      "uncommunicative",
      "shut down",
      "closed off",
    ],
  },

  // Distant → Numb
  Numb: {
    variants: ["numbness", "numbing", "numbed"],
    synonyms: [
      "emotionless",
      "unfeeling",
      "desensitized",
      "deadened",
      "insensitive",
    ],
    related: ["apathetic", "detached", "disconnected", "empty", "blank"],
  },

  // Frustrated → Infuriated
  Infuriated: {
    variants: ["infuriate", "infuriating"],
    synonyms: ["enraged", "furious", "livid", "incensed", "irate", "wrathful"],
    related: ["angry", "mad", "outraged", "seething", "boiling"],
  },

  // Frustrated → Annoyed
  Annoyed: {
    variants: ["annoy", "annoyance", "annoying"],
    synonyms: [
      "irritated",
      "bothered",
      "vexed",
      "irked",
      "exasperated",
      "peeved",
    ],
    related: ["frustrated", "aggravated", "perturbed", "bugged", "ticked off"],
  },

  // Aggressive → Provoked
  Provoked: {
    variants: ["provoke", "provocation", "provoking"],
    synonyms: ["incited", "goaded", "antagonized", "stimulated", "instigated"],
    related: ["triggered", "challenged", "aggravated", "baited", "riled up"],
  },

  // Aggressive → Hostile
  Hostile: {
    variants: ["hostility", "hostilely"],
    synonyms: [
      "antagonistic",
      "aggressive",
      "belligerent",
      "combative",
      "confrontational",
    ],
    related: ["unfriendly", "threatening", "angry", "adversarial", "militant"],
  },

  // Mad → Furious
  Furious: {
    variants: ["fury", "furiously"],
    synonyms: ["enraged", "livid", "irate", "incensed", "wrathful", "raging"],
    related: ["angry", "mad", "infuriated", "seething", "fuming", "ballistic"],
  },

  // Mad → Jealous
  Jealous: {
    variants: ["jealousy", "jealously"],
    synonyms: [
      "envious",
      "covetous",
      "resentful",
      "green with envy",
      "grudging",
    ],
    related: ["possessive", "suspicious", "bitter", "insecure", "territorial"],
  },

  // Bitter → Indignant
  Indignant: {
    variants: ["indignation", "indignantly"],
    synonyms: ["offended", "outraged", "affronted", "resentful", "incensed"],
    related: ["angry", "insulted", "wronged", "violated", "huffy"],
  },

  // Bitter → Violated
  Violated: {
    variants: ["violate", "violation", "violating"],
    synonyms: [
      "transgressed",
      "infringed",
      "breached",
      "wronged",
      "trespassed",
    ],
    related: ["abused", "disrespected", "invaded", "betrayed", "defiled"],
  },

  // Humiliated → Disrespected
  Disrespected: {
    variants: ["disrespect", "disrespecting", "disrespectful"],
    synonyms: ["insulted", "slighted", "demeaned", "belittled", "dishonored"],
    related: ["offended", "degraded", "scorned", "put down", "dissed"],
  },

  // Humiliated → Ridiculed
  Ridiculed: {
    variants: ["ridicule", "ridiculing"],
    synonyms: [
      "mocked",
      "derided",
      "scorned",
      "jeered",
      "taunted",
      "lampooned",
    ],
    related: ["humiliated", "laughed at", "made fun of", "teased", "belittled"],
  },

  // Let down → Betrayed
  Betrayed: {
    variants: ["betray", "betrayal", "betraying"],
    synonyms: [
      "deceived",
      "double-crossed",
      "backstabbed",
      "sold out",
      "stabbed in the back",
    ],
    related: ["hurt", "disappointed", "let down", "abandoned", "cheated"],
  },

  // Let down → Resentful
  Resentful: {
    variants: ["resent", "resentment", "resenting"],
    synonyms: ["bitter", "indignant", "aggrieved", "grudging", "embittered"],
    related: ["angry", "hurt", "vindictive", "spiteful", "sour"],
  },

  // ============================================
  // FEARFUL BRANCH
  // ============================================

  // Threatened → Nervous
  Nervous: {
    variants: ["nerve", "nervousness", "nervously"],
    synonyms: ["anxious", "jittery", "uneasy", "tense", "edgy", "jumpy"],
    related: ["worried", "apprehensive", "on edge", "restless", "fidgety"],
  },

  // Threatened → Exposed
  Exposed: {
    variants: ["expose", "exposure", "exposing"],
    synonyms: ["vulnerable", "unprotected", "defenseless", "uncovered", "bare"],
    related: ["revealed", "open", "unsafe", "at risk", "naked"],
  },

  // Rejected → Excluded
  Excluded: {
    variants: ["exclude", "exclusion", "excluding"],
    synonyms: ["left out", "shut out", "ostracized", "isolated", "blackballed"],
    related: ["rejected", "unwanted", "barred", "unwelcome", "shunned"],
  },

  // Rejected → Persecuted
  Persecuted: {
    variants: ["persecute", "persecution", "persecuting"],
    synonyms: ["oppressed", "victimized", "harassed", "tormented", "hounded"],
    related: ["targeted", "mistreated", "bullied", "abused", "picked on"],
  },

  // Weak → Worthless
  Worthless: {
    variants: ["worth", "worthlessness"],
    synonyms: [
      "useless",
      "valueless",
      "insignificant",
      "meaningless",
      "good-for-nothing",
    ],
    related: ["inadequate", "inferior", "unimportant", "pathetic", "pointless"],
  },

  // Weak → Insignificant
  Insignificant: {
    variants: ["insignificance"],
    synonyms: [
      "unimportant",
      "trivial",
      "minor",
      "negligible",
      "inconsequential",
      "petty",
    ],
    related: ["worthless", "small", "meaningless", "irrelevant", "tiny"],
  },

  // Insecure → Inadequate
  Inadequate: {
    variants: ["inadequacy"],
    synonyms: [
      "insufficient",
      "deficient",
      "lacking",
      "incompetent",
      "unqualified",
    ],
    related: ["insecure", "incapable", "inferior", "not good enough", "subpar"],
  },

  // Insecure → Inferior
  Inferior: {
    variants: ["inferiority"],
    synonyms: [
      "lesser",
      "subordinate",
      "inadequate",
      "second-rate",
      "substandard",
    ],
    related: ["worthless", "incompetent", "deficient", "subpar", "not as good"],
  },

  // Anxious → Overwhelmed
  Overwhelmed: {
    variants: ["overwhelm", "overwhelming"],
    synonyms: [
      "swamped",
      "inundated",
      "overcome",
      "overburdened",
      "overloaded",
    ],
    related: ["stressed", "exhausted", "drowning", "crushed", "buried"],
  },

  // Anxious → Worried
  Worried: {
    variants: ["worry", "worrying", "worrisome"],
    synonyms: [
      "concerned",
      "troubled",
      "anxious",
      "uneasy",
      "apprehensive",
      "fretful",
    ],
    related: ["nervous", "fearful", "distressed", "bothered", "on edge"],
  },

  // Scared → Helpless
  Helpless: {
    variants: ["helplessness"],
    synonyms: ["powerless", "defenseless", "vulnerable", "weak", "impotent"],
    related: ["hopeless", "unable", "trapped", "dependent", "at the mercy of"],
  },

  // Scared → Frightened
  Frightened: {
    variants: ["fright", "frighten", "frightening"],
    synonyms: [
      "scared",
      "terrified",
      "afraid",
      "fearful",
      "alarmed",
      "petrified",
    ],
    related: ["panicked", "startled", "spooked", "terrorized", "shaken"],
  },

  // ============================================
  // BAD BRANCH
  // ============================================

  // Bored → Indifferent
  Indifferent: {
    variants: ["indifference"],
    synonyms: [
      "apathetic",
      "uninterested",
      "unconcerned",
      "detached",
      "impassive",
    ],
    related: ["numb", "emotionless", "dispassionate", "aloof", "blasé"],
  },

  // Bored → Apathetic
  Apathetic: {
    variants: ["apathy"],
    synonyms: [
      "indifferent",
      "uninterested",
      "emotionless",
      "insensible",
      "unfeeling",
      "dispassionate",
      "nonchalant",
      "stoic",
    ],
    related: ["bored", "listless", "unmotivated", "lethargic", "uncaring"],
  },

  // Busy → Pressured
  Pressured: {
    variants: ["pressure", "pressuring"],
    synonyms: ["stressed", "strained", "burdened", "pushed", "squeezed"],
    related: [
      "overwhelmed",
      "rushed",
      "forced",
      "constrained",
      "under pressure",
    ],
  },

  // Busy → Rushed
  Rushed: {
    variants: ["rush", "rushing"],
    synonyms: ["hurried", "hasty", "frantic", "pressed for time", "racing"],
    related: ["busy", "stressed", "hectic", "frenzied", "in a hurry"],
  },

  // Stressed → Overwhelmed
  Overwhelmed: {
    variants: ["overwhelm", "overwhelming"],
    synonyms: [
      "swamped",
      "inundated",
      "overcome",
      "overburdened",
      "overloaded",
    ],
    related: ["stressed", "exhausted", "drowning", "crushed", "buried"],
  },

  // Stressed → Out of Control
  "Out of Control": {
    variants: ["uncontrolled", "uncontrollable"],
    synonyms: ["chaotic", "wild", "unmanageable", "frenzied", "out of hand"],
    related: ["overwhelmed", "panicked", "helpless", "spiraling", "crazy"],
  },

  // Tired → Sleepy
  Sleepy: {
    variants: ["sleep", "sleepiness"],
    synonyms: [
      "drowsy",
      "fatigued",
      "weary",
      "exhausted",
      "lethargic",
      "somnolent",
    ],
    related: ["tired", "drained", "sluggish", "zonked", "pooped"],
  },

  // Tired → Unfocused
  Unfocused: {
    variants: ["unfocus"],
    synonyms: [
      "distracted",
      "scattered",
      "disoriented",
      "inattentive",
      "spaced out",
    ],
    related: ["lost", "confused", "foggy", "hazy", "all over the place"],
  },

  // ============================================
  // SURPRISED BRANCH
  // ============================================

  // Startled → Shocked
  Shocked: {
    variants: ["shock", "shocking"],
    synonyms: [
      "stunned",
      "astounded",
      "astonished",
      "startled",
      "dumbfounded",
      "stupefied",
    ],
    related: [
      "surprised",
      "taken aback",
      "speechless",
      "floored",
      "blown away",
    ],
  },

  // Startled → Dismayed
  Dismayed: {
    variants: ["dismay", "dismaying"],
    synonyms: [
      "alarmed",
      "distressed",
      "upset",
      "troubled",
      "concerned",
      "appalled",
    ],
    related: [
      "disappointed",
      "discouraged",
      "disheartened",
      "worried",
      "disturbed",
    ],
  },

  // Confused → Disillusioned
  Disillusioned: {
    variants: ["disillusion", "disillusionment"],
    synonyms: ["disappointed", "let down", "disenchanted", "cynical", "jaded"],
    related: ["betrayed", "bitter", "skeptical", "eye-opened", "awakened"],
  },

  // Confused → Perplexed
  Perplexed: {
    variants: ["perplex", "perplexity", "perplexing"],
    synonyms: [
      "puzzled",
      "confused",
      "baffled",
      "bewildered",
      "mystified",
      "confounded",
    ],
    related: ["lost", "uncertain", "stumped", "befuddled", "at a loss"],
  },

  // Amazed → Astonished
  Astonished: {
    variants: ["astonish", "astonishment", "astonishing"],
    synonyms: [
      "amazed",
      "astounded",
      "stunned",
      "shocked",
      "surprised",
      "dumbfounded",
    ],
    related: [
      "impressed",
      "awestruck",
      "flabbergasted",
      "blown away",
      "gobsmacked",
    ],
  },

  // Amazed → Awe
  Awe: {
    variants: ["awed", "awesome", "awestruck"],
    synonyms: ["wonder", "amazement", "reverence", "admiration", "veneration"],
    related: ["impressed", "inspired", "humbled", "overwhelmed", "breathless"],
  },

  // Excited → Eager
  Eager: {
    variants: ["eagerness", "eagerly"],
    synonyms: [
      "enthusiastic",
      "keen",
      "anxious",
      "impatient",
      "avid",
      "zealous",
    ],
    related: ["excited", "motivated", "ready", "pumped", "raring to go"],
  },

  // Excited → Energetic
  Energetic: {
    variants: ["energy", "energize", "energized"],
    synonyms: [
      "lively",
      "vigorous",
      "dynamic",
      "spirited",
      "animated",
      "vivacious",
    ],
    related: ["excited", "pumped", "active", "vibrant", "fired up"],
  },
};

export default RELATED_WORDS_MAP;
