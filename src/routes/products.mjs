import { Router } from "express"
import { mockProducts } from '../utils/constants.mjs'

const router = Router()


router.get("/api/products", (request, response) => {
    response.status(201).send(mockProducts)
})


export default router