import express from 'express'
import { routes } from './routes/index.mjs'

// query is used for validating query parameters (used as middleware)
// body is used for validating request bodies

const app = express()


// Add middleware using .use
// Allow express to parse json data - from post type requests
app.use(express.json())
app.use(routes)


/* /////////// MIDDLEWARE ////////////////// */

// Create logging middleware
const loggingMiddleware = (request, response, next) => {
    console.log(`${request.method} - ${request.url} `)
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

// allows you to listen to a port for incoming requests
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})
