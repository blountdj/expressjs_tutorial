// a router is something we call to create an instance of an express router
import { Router } from "express"
import { query, validationResult, checkSchema, matchedData } from "express-validator"
import { mockUsers } from "../utils/constants.mjs"
import { createUserValidationSchema } from "../utils/validationSchemas.mjs"
import { resolveIndexByUserId } from './../utils/middlewares.mjs'
import { User } from "../mongoose/schemas/user.mjs"

const router = Router()

router.get(
    "/api/users",
    [query("filter")
        .isString()
        .notEmpty().withMessage('Must not be empty')
        .isLength({ min: 3, max: 10}).withMessage('Must be at least 3-10')], 
    (request, response) => {
    request.sessionStore.get(request.session.id, (err, sessionData) => {
        if (err) {
            console.log(err)
            throw err
        }
        console.log(sessionData)
    })
    const result = validationResult(request) // extract validation errors
    console.log(result)

    console.log(request.query)
    const {
        query: { filter, value },
    } = request

    if (filter && value) return response.status(201).send(mockUsers.filter((user) => user[filter].includes(value)))

    return response.status(200).send(mockUsers)
}
)

// OLD CODE - before using mongodb database
// USING checkSchema - createUserValidationSchema
// router.post("/api/users", 
//     checkSchema(createUserValidationSchema),
//     (request, response) => {
      
//         const result = validationResult(request) // extract validation errors
//         console.log(result)

//         // check if there are validation errors
//         if(!result.isEmpty()) {
//             return response.status(400).send({ errors: result.array()})
//         }

//         // will give you the validated data
//         const data = matchedData(request)

//         // Create new user
//         const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...data}
//         mockUsers.push(newUser)

//         return response.status(201).send(newUser)
// })

router.post("/api/users", 
    checkSchema(createUserValidationSchema),
    async (request, response) => {
        const result = validationResult(request)
        if (!result.isEmpty()) return response.status(400).send(result.array())

        const data = matchedData(request)
        console.log(data)
        const newUser = new User(data)
        try {
            const saveUser = await newUser.save()
            return response.status(201).send(saveUser)
        } catch (err) {
            console.log(err)
            return response.sendStatus(400)
        }
    })



// Using a route parameter
router.get("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { findUserIndex } = request

    const findUser = mockUsers[findUserIndex]

    // Check Id exists
    if (!findUser) return response.sendStatus(404)

    // Return user
    return response.send(findUser)

})

// PATCH REQUEST - updates a record, partially. Not everything on the record
// PUT REQUEST - you update the entire record.

router.put("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { body, findUserIndex } = request

    // update user (not id)
    mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body}

    console.log(mockUsers)
    return response.sendStatus(204)

})

router.patch("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { body, findUserIndex } = request

    mockUsers[findUserIndex] = { ...mockUsers, ...body}
})

router.delete("/api/users/:id", resolveIndexByUserId, (request, response) => {
    const { findUserIndex } = request

    mockUsers.splice(findUserIndex, 1)
    return response.sendStatus(200)
    
})


export default router