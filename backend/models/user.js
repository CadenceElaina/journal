const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: String,
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
    role: String,
    refreshToken: String,
    isDemo: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// will not embed an array of journal entries to prevent performance and scalability issues

userSchema.index({ isDemo: 1, lastActivity: 1 }); // tells MongoDB to create a database-level index to speed up queries - sorted index on these fields for lookups - instead of searching entire phone book search by alphabetical tabs

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
