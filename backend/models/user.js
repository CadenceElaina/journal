const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: String,
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3,
    },
    passwordHash: String,
    timestamps: true,
    // will not embed an array of journal entries to prevent performance and scalability issues
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User