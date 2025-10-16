const journalsRouter = require('express').Router()
const Journal = require('../models/journal')
const User = require('../models/user')

journalsRouter.get('/', async (request, response, next) => {
    try {
        const journals = await Journal.find({}).populate('user', {username: 1, name: 1})
        response.json(journals)
    } catch (error) {
        next(error)
    }
})

journalsRouter.get('/:id', async (request, response, next) => {
    try {
        const journal = await Journal.findById(request.params.id)
        if (journal) {
            response.json(journal)
        } else {
            response.status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

journalsRouter.post('/', async (request, response, next) => {
    try {
        if (!request.user) {
            return response.status(401).json({error: "token missing or invalid"})
        }

        const journal = new Journal({
            title: request.body.title,
            content: request.body.content,
            tags: request.body.tags,
            mood: request.body.mood,
            user: request.user._id
        })

        const savedJournal = await journal.save()
        response.json(savedJournal)
    } catch (error) {
        next(error)
    }
})

journalsRouter.delete('/:id', async (request, response, next) => {
    try {
        if (!request.user) {
            return response.status(401).json({error: "token missing or invalid"})
        }
        
        const journal = await Journal.findById(request.params.id)

        if (!journal) {
            return response.status(404).json({error: "Journal entry not found"})
        }

        if (journal.user.toString() !== request.user._id.toString()) {
            return response.status(401).json({error: "unauthorized operation"})
        }

        await Journal.deleteOne({ _id: request.params.id })
        response.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

journalsRouter.put('/:id', async (request, response, next) => {
    try {
        if (!request.user) {
            return response.status(401).json({error: "token missing or invalid"})
        }

        const journal = await Journal.findById(request.params.id)
        
        if (!journal) {
            return response.status(404).json({error: "Journal entry not found"})
        }

        if (journal.user.toString() !== request.user._id.toString()) {
            return response.status(401).json({error: "unauthorized operation"})
        }

        const updatedJournal = {
            title: request.body.title,
            content: request.body.content,
            tags: request.body.tags,
            mood: request.body.mood
        }

        const result = await Journal.findByIdAndUpdate(
            request.params.id, 
            updatedJournal, 
            { new: true, runValidators: true }
        )

        response.json(result)
    } catch (error) {
        next(error)
    }
})

module.exports = journalsRouter