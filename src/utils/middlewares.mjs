import { mockUsers } from "./constants.mjs"


export const resolveIndexByUserId = () => {   
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
