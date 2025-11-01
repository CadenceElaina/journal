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
    pendingEmail: {
      type: String,
      trim: true,
    }, //Temporary storage for email change until verified
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    passwordHash: String,
    refreshToken: String,

    // 2FA
    twoFactorSecret: String, // TOTP secret
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    backupCodes: {
      type: [String],
      default: [],
    }, // If user loses phone access they have a way in

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
      specialty: { type: [String], default: [] },
      license: { type: [String], default: [] },
      bio: { type: String, trim: true, default: "" },
    },

    // --- App level Flags ---
    isDemo: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// will not embed an array of journal entries to prevent performance and scalability issues

userSchema.index({ isDemo: 1, lastActivity: 1 }); // tells MongoDB to create a database-level index to speed up queries - sorted index on these fields for lookups - instead of searching entire phone book search by alphabetical tabs

// Increment failed login attempts
userSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 }, // Reset counter to 1
      // Using unset to remove field allows checking by (this.lockUntil) instead of if null or not
      $unset: { lockUntil: 1 }, // Remove the lockUntil field entirely
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  // Check if lockUntil exists and hasn't expired
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Reset login attempts after successful login
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

userSchema.set("toJSON", {
  virtuals: true, // Include virtuals like 'fullName'
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash; // the passwordHash should not be revealed
    delete returnedObject.refreshToken;
  },
});

//const User = mongoose.model("User", userSchema);

//module.exports = User
module.exports = mongoose.model("User", userSchema);
