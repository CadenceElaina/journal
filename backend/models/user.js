const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    // --- Name Structure ---
    prefix: {
      // Dr., Mrs. Ms., Mr., etc.
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    suffix: {
      // MD, DO, PsyD, PhD, LCSW, etc.
      type: String,
      trim: true,
    },

    // --- Authentication ---
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 9, // a@aol.com - 9 min? what other site is less than 3 ig .io exists etc
    },
    passwordHash: String,
    refreshToken: String,

    // --- Role & Relationship Management ---
    role: {
      type: String,
      required: true,
      enum: ["provider", "nonProvider"],
    },
    // For nonProvider roles: List of their proivders
    providers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // For provider roles: List of their clients
    clients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // --- Provider Specific Info ---
    providerProfile: {
      specialty: { type: String, trim: true },
      license: { type: String, trim: true },
      bio: { type: String, trim: true },
    },

    // --- App level Flags ---
    isDemo: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// will not embed an array of journal entries to prevent performance and scalability issues

userSchema.index({ isDemo: 1, lastActivity: 1 }); // tells MongoDB to create a database-level index to speed up queries - sorted index on these fields for lookups - instead of searching entire phone book search by alphabetical tabs

userSchema.set("toJSON", {
  virtuals: true, // Include virtuals like 'fullName'
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash; // the passwordHash should not be revealed
    //TODO: delete returnedObject.refreshToken - Should this be hidden too?
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
