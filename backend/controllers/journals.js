const journalsRouter = require('express').Router()
const Journal = require('../models/journal')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')
const config = require('../utils/config')

journalsRouter.get('/', async (request, response) => {
    const journals = await Journal.find({}).populate('user', {username: 1, name: 1})
    response.json(journals)
})

journalsRouter.get('/:id', async (request, response) => {
    const journal = await Journal.findById(request.params.id)
    if(journal) {
        response.json(journal)
    } else {
        response.status(404).end()
    }
})

journalsRouter.post('/', async (request, response) => {
    const body = request.body
    const user = request.user
    const token = request.token

    const decodedToken = jwt.verify(token, config.SECRET)
    if(!(token && decodedToken.id)) {
        return response.status(401).json({error: "token missing or invalid"})
    }

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

journalsRouter.delete('/:id', async (request, response) => {
    const token = request.token
    const decodedToken = jwt.verify(token, config.SECRET)
    if(!(token && decodedToken.id)) {
        return response.status(401).json({error: "token missing or invalide"})
    }

    const id = request.params.id
    const journal = await Journal.findById(id)

    //check if author/user matches journal author ? then delete else unauthorized
    //in fullstackopen the user has their journals embeded to be able to check if they are author but here we need to check somehow?

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