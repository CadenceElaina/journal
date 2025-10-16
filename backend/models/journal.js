const mongoose = require('mongoose')

const journalSchema = new mongoose.Schema({
    isShared: Boolean,
    title: {
        type: String,
        required: true,
        trim: true, //removes whitespace from both ends of the string
    },
    content: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        default: []
    },
    moods: {
        type: String,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
},
    {
        timestamps: true, //handles createdAt and updatedAt fields 
    }
)

journalSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Journal', journalSchema)