import express, { request, response } from 'express'


// query is used for validating query parameters (used as middleware)
// body is used for validating request bodies
import { query, validationResult, body, matchedData, checkSchema } from "express-validator"
import { createUserValidationSchema } from './utils/validationSchemas.mjs'

/* /////////// DATA ////////////////// */
const mockUsers = [
    {id: 1, username: "darren", displayName: 'ayupduck'},
    {id: 2, username: "fred", displayName: 'nowthen'},
    {id: 3, username: "bob", displayName: 'cobbler'},
    {id: 4, username: "sid", displayName: 'smith'},
    {id: 5, username: "clive", displayName: 'turtles'},
    {id: 6, username: "harold", displayName: 'pranger'},
    {id: 7, username: "trevor", displayName: 'ghosted'},
    {id: 8, username: "dennis", displayName: 'nobody'},]

const mockProducts = [
    {id: 123, product: "book", price: 9.99},
    {id: 124, product: "bike", price: 197.99},
    {id: 125, product: "monitor", price: 599.64},]


const app = express()


// Add middleware using .use
// Allow express to parse json data - from post type requests
app.use(express.json())




/* /////////// MIDDLEWARE ////////////////// */

// Create logging middleware
const loggingMiddleware = (request, response, next) => {
    console.log(`${request.method} - ${request.url} `)
    next()
}

const resolveIndexByUserId = () => {
    const {
        body, 
        params: { id },
    } = request

    const parsedId = parseInt(request.params.id)

    // Check Id is number
    if (isNaN(parsedId)) return response.status(400).send({ msg: "Bad Request. Invalid ID." })

    const findUserIndex = mockUsers.find((user) => user.id === parsedId)
    
    // Check Id exists
    if (findUserIndex === -1) return response.sendStatus(404)

    request.findUserIndex = findUserIndex
    next()
}


// Assign middleware to work globally
app.use(loggingMiddleware)

// Assign middleware to a specific route (if not using globally) - 
// pass it as a function, eg:
app.get("/dummy_end_point", loggingMiddleware, (request, response) => {
    console.log('logging middleware will run before this')
})


// use port number from .env file, if not available use 3000
const PORT = process.env.PORT || 3000




app.get("/", (request, response) => {
    response.status(201).send({msg: 'ay up world'})
})

app.get("/api/users", 
    [query("filter")
        .isString()
        .notEmpty().withMessage('Must not be empty')
        .isLength({ min: 3, max: 10}).withMessage('Must be at least 3-10')], 
    (request, response) => {
    
    const result = validationResult(request) // extract validation errors
    console.log(result)

    console.log(request.query)
    const {
        query: { filter, value },
    } = request

    if (filter && value) return response.status(201).send(mockUsers.filter((user) => user[filter].includes(value)))

    return response.status(200).send(mockUsers)
})

// USING checkSchema - createUserValidationSchema
app.post("/api/users", 
    checkSchema(createUserValidationSchema),
    (request, response) => {
      
        const result = validationResult(request) // extract validation errors
        console.log(result)

        // check if there are validation errors
        if(!result.isEmpty()) {
            return response.status(400).send({ errors: result.array()})
        }

        // will give you the validated data
        const data = matchedData(request)

        // Create new user
        const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...data}
        mockUsers.push(newUser)

        return response.status(201).send(newUser)
})


// Using a route parameter
app.get("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { findUserIndex } = request

    const findUser = mockUsers[findUserIndex]

    // Check Id exists
    if (!findUser) return response.sendStatus(404)

    // Return user
    return response.send(findUser)

})

app.get("/api/products", (request, response) => {
    response.status(201).send(mockProducts)
})

// allows you to listen to a port for incoming requests
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})

// PATCH REQUEST - updates a record, partially. Not everything on the record
// PUT REQUEST - you update the entire record.

app.put("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { body, findUserIndex } = request

    // update user (not id)
    mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body}

    console.log(mockUsers)
    return response.sendStatus(204)

})

app.patch("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { body, findUserIndex } = request

    mockUsers[findUserIndex] = { ...mockUsers, ...body}
})

app.delete("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { findUserIndex } = request

    mockUsers.splice(findUserIndex, 1)
    return response.sendStatus(200)
    
})