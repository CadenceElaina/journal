const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await User.find({})
        response.json(users)
    } catch (error) {
        next(error)
    }
})

usersRouter.post('/', async (request, response, next) => {
    try {
        const {name, username, password} = request.body

        if (!(username && password)) {
            return response.status(400).json({
                error: "username and password must be given",
            })
        }

        const existingUser = await User.findOne({username})
        if (existingUser) {
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
    } catch (error) {
        next(error)
    }
})

module.exports = usersRouter