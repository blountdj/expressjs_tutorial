import express, { response } from 'express'
import routes from './routes/index.mjs'
import cookieParser from "cookie-parser"
import session from 'express-session'
import { mockUsers } from './utils/constants.mjs'

// query is used for validating query parameters (used as middleware)
// body is used for validating request bodies

const app = express()


// Add middleware using .use
// Allow express to parse json data - from post type requests
app.use(express.json())
app.use(cookieParser()) // call before routes
app.use(session({
    secret: 'super secret pw',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60,
    }
})) // call before routes
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
    console.log(request.session.id)
    console.log(request.session)
    request.session.visited = true
    response.cookie("hello", "world", { maxAge: 60000 * 6 })
    response.status(201).send({msg: 'ay up world'})
})



app.post('/api/auth', (request, response) => {
    const { body: { username, password }} = request
    const findUser = mockUsers.find(
        (user) => user.username === username
    )
    
    if (!findUser || findUser.password !== password) 
        return response.status(401).send({ msg: "Bad Credentials"})


    request.session.user = findUser
    return response.status(200).send(findUser)

})

// allows you to listen to a port for incoming requests
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})
