const journalsRouter = require('express').Router()
const Journal = require('../models/journal')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if(authorization && authorization.startsWith('Bearer ')){
        return authorization.replace('Bearer ', '')
    }
    return null
}

journalsRouter.get('/', async (request, response) => {
    const journals = await Journal
    .find({}).populate('user', {username: 1, name: 1})
    response.json(journals)
})

journalsRouter.post('/', async (request, response) => {
    const body = request.body
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid'})
    }

    const user = await User.findById(decodedToken.id)
    const journal = new Journal({
        title: body.title,
        content: body.content,
        tags: body.tags,
        moods: body.moods,
        user: user._id
    })
    const savedJournal = await journal.save()

    response.json(savedJournal)
})

journalsRouter.get('/:id', async (request, response) => {
    const journal = await Journal.findById(request.params.id)
    if(journal) {
        response.json(journal)
    } else {
        response.status(404).end()
    }
})

journalsRouter.delete('/:id', async (request, response) => {
    await Journal.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

journalsRouter.put('/:id', (request, response, next) => {
    const body = request.body

    const journal = {
        title: body.title,
        content: body.content,
        tags: body.tags,
        moods: body.moods,
       // user: user._id //is this needed? 
    }

    Journal.findByIdAndUpdate(request.params.id, journal, {new: true})
    .then(updatedJournal => {
        response.json(updatedJournal)
    })
    .catch(error => next(error))
})

module.exports = journalsRouter