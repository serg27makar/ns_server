import express from 'express'
import dotenv from "dotenv";
import {uploadPhotos} from "../middleware/upload.js";
import {productDelete, productsCreate, productsGetByShopId, productUpdate} from "../controllers/products.controller.js";
dotenv.config()

const router = express.Router()

router.post('/create', uploadPhotos, productsCreate)
router.get('/:id', productsGetByShopId)
router.put('/:id', uploadPhotos, productUpdate)
router.delete('/:id', productDelete)

export default router
