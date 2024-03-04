import express, { request, response } from 'express'
import routes from './routes/index.mjs'
import cookieParser from "cookie-parser"
import session from 'express-session'
import { mockUsers } from './utils/constants.mjs'
import passport from 'passport'
import './strategies/local-strategy.mjs'

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

// Must be AFTER setting up session and BEFORE routes
app.use(passport.initialize())
app.use(passport.session())

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


// example auth endpoint, not best practices
// app.post("/api/auth", (request, response) => {
//     const { body: { username, password}, } = request;
//     const findUser = mockUsers.find((user) => user.username = username);
//     if (!findUser || findUser.password !== password) return response.status(401).send({ msg: "BAD CREDENTIALS" })
    
//     request.session.user = findUser;
//     return response.status(200).send(findUser)

// })

app.post(
    "/api/auth", 
    passport.authenticate("local"), 
    (request, response) => {
        response.sendStatus(200)

})

app.get('/api/auth/status', (request, response) => {
    console.log(`Inside /api/auth/status endpoint`)
    console.log(request.user)
    console.log(request.session)

    return request.user
        ? response.status(200).send(request.user)
        : response.status(401).send({ msg: "Not Authenticated" })
})

app.post("/api/cart", (request, response) => {
    if (!request.session.user) return response.sendStatus(401)
    const { body: item } = request
    const { cart } = request.session
    if (cart) {
        cart.push(item)
    } else {
        request.session.cart = [item]
    }
    return response.status(201).send(item)
})

app.get("/api/cart", (request, response) => {
    if (!request.session.user) return response.sendStatus(401)
    return response.send(request.session.cart ?? [])
})

app.post("/api/auth/logout", (request, response) => {
    if (!request.user) return response.sendStatus(401)

    request.logOut((err) => {
        if (err) return response.sendStatus(400)
        response.sendStatus(200)
    })
})




// allows you to listen to a port for incoming requests
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})
