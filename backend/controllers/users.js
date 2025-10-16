const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('journals', {
        title: 1, 
        content: 1, 
        tags: 1, 
        moods: 1 
    })

    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const {name, username, password } = request.body //pass timestamps? or?

    if(!(username && password)) {
        return response.status(400).json({
            error: "username and password must be given",
        })
    }

    const existingUser = await User.findOne({ username })
    if(existingUser){
        return response.status(400).json({
            error: "username must be unique",
        })
    }
    
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        name,
        username,
        passwordHash
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})


module.exports = usersRouter