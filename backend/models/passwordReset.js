const mongoose = require("mongoose");

const passwordResetSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 9, // a@aol.com - 9 min? what other site is less than 3 ig .io exists etc
    },
    resetCode: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // when expiresAt time arrives, delete the document after 0 seconds

passwordResetSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);

module.exports = PasswordReset;
