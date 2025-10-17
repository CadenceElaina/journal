const journalsRouter = require('express').Router()
const Journal = require('../models/journal')
const User = require('../models/user')

journalsRouter.get('/', async (request, response, next) => {
    try {
             // --- 1. DESTRUCTURE AND PREPARE PARAMETERS ---
        const {
            term,
            tags,
            moods,
            startDate,
            endDate,
            date,
            sort = 'newest', // Default sort
            page = 1,
            limit = 10
        } = request.query

     // --- 2. BUILD THE DYNAMIC QUERY OBJECT ---
     const queryConditions = []
        
        // Term to search in Title and Content of entries
        if(term){
            queryConditions.push({ $text: {$search: term}})
        }

        // Tags Filter
        if(tags){
            const tagsArray = tags.split(',').map(tag => tag.trim())
            // $all ensures the entry has ALL the specified tags
            queryConditions.push({tags: {$all: tagsArray}})
        }

        // Moods Filter
        if(moods){
            const moodsArray = moods.split(',').map(mood => mood.trim())
            // $in ensures the entry has ANY of the specified moods
            queryConditions.push({moods: {$in: moodsArray}})
        }

        // Date filtering 
        const dateQuery = {}
        if(startDate){
            dateQuery.$gte = new Date(startDate)
        }
        if(endDate){
            // To make the range inclusive of the end day, we set it to the end of that day.
            let end = new Date(endDate)
            end.setUTCHours(23, 59, 59, 999)
            dateQuery.$lte = end
        }

        if(date){
            let startOfDay = new Date(date)
            startOfDay.setUTCHours(0, 0, 0, 0) //0th hour, minute, second, millisecond
            let endOfDay = new Date(date)
            endOfDay.setUTCHours(23, 59, 59, 999) //last hour, minute, second, millisecond
            dateQuery.$gte = startOfDay
            dateQuery.$lte = endOfDay

            //DB stores exact time of day a journal is created - which is why we need to search from beginning of day to end for the day otherwise we may miss entries on that day
        }

        if (Object.keys(dateQuery).length > 0){
            queryConditions.push({ createdAt: dateQuery })
        }

        if(!request.user){
            return response.status(401).json({error: "unauthorized"})
        }
        // Finalize query object, handle case where there are no filters.
        const finalQuery = {
            user: request.user._id, // Only this user's journals
            ...(queryConditions.length > 0 ? { $and: queryConditions } : {})
        }

        // --- 3. BUILD THE SORT OBJECT --- 
        // MongoDB sorts by key you want to sort by (title, createdAt) and the value is the direction 1 for ascending and -1 for descending
        let sortOptions = {}
        switch (sort) {
            case 'oldest':
                sortOptions = {createdAt: 1}
                break;
            case 'alpha':
                sortOptions = {title: 1}
                break;
            case 'edited':
                sortOptions = {updatedAt: -1}
                break;
            case 'wordcount_desc':
                sortOptions = { wordCount: -1}
                break;
            case 'wordcount_asc':
                sortOptions = { wordCount: 1}
                break;
            case 'newest':
            default:
                sortOptions = {createdAt: -1};
                break;
        }
        

        // --- 4. EXECUTE QUERY WITH PAGINATION ---
        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10) //size of page (tells DB no matter how many results only give me x)
        const skip = (pageNum - 1) * limitNum //ignore the first x results you find and then start counting from the limit
        //page 1 we want to skip 0 - (1 - 1) * 10 = 10 - .skip(0).limit(10)
        //page 2 we want to skip results from the first page - (2 - 1) * 10 = 10 - .skip(10).limit(10)
        //page 3 we want to skip results from the first and second page - (3 - 1) * 10 = 20 - .skip(20).limit(10)
        //page n - (n - 1) * 10 - omits pages before current page...
        
        const journals = await Journal.find(finalQuery)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .lean() // .lean() for faster read-only operations

        // To provide total count for frontend pagination UI
        const totalJournals = await Journal.countDocuments(finalQuery)
        
        response.json({
            journals,
            currentPage: pageNum,
            totalPages: Math.ceil(totalJournals / limitNum),
            totalJournals
        }) 

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

        const wordCount = request.body.content.split(/\s+/).filter(word => word.length > 0).length

        const journal = new Journal({
            title: request.body.title,
            content: request.body.content,
            tags: request.body.tags,
            moods: request.body.moods,
            user: request.user._id,
            wordCount: wordCount
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

        const wordCount = request.body.content.split(/\s+/).filter(word => word.length > 0).length

        const updatedJournal = {
            title: request.body.title,
            content: request.body.content,
            tags: request.body.tags,
            moods: request.body.moods,
            wordCount: wordCount,
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