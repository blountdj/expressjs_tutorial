import express from 'express'

const app = express()

// use port number from .env file, if not available use 3000
const PORT = process.env.PORT || 3000

const mockUsers = [
    {id: 1, username: "Darren", displayName: 'ayupduck'},
    {id: 2, username: "Fred", displayName: 'nowthen'},
    {id: 3, username: "Bob", displayName: 'cobbler'},]

const mockProducts = [
    {id: 123, product: "book", price: 9.99},
    {id: 124, product: "bike", price: 197.99},
    {id: 125, product: "monitor", price: 599.64},]


app.get("/", (request, response) => {
    response.status(201).send({msg: 'ay up world'})
})

app.get("/api/users", (request, response) => {
    response.status(201).send(mockUsers)
})

// Using a route parameter
app.get("/api/users/:id", (request, response) => {
    console.log(request.params)
    const parsedId = parseInt(request.params.id)
    if (isNaN(parsedId)) return response.status(400).send({ msg: "Bad Request. Invalid ID." })

    const findUser = mockUsers.find((user) => user.id === parsedId)
    if (!findUser) return response.sendStatus(404)

    return response.send(findUser)

})

app.get("/api/products", (request, response) => {
    response.status(201).send(mockProducts)
})

// allows you to listen to a port for incoming requests
app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})
