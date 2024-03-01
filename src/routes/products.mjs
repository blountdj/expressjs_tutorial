import { Router } from "express"
import { mockProducts } from '../utils/constants.mjs'


const router = Router()


router.get("/api/products", (request, response) => {
    console.log(request.headers.cookie)
    console.log(request.cookies) // parsed cookie using cookie-parse (middleware assigned on index.mjs)

    if (request.cookies.hello && request.cookies.hello === "world") 
        return response.status(201).send(mockProducts)

    return response.status(201).send({ msg: "Sorry. You need the correct cookie"})
})


export default router