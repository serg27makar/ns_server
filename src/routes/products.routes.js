import express from 'express'
import dotenv from "dotenv";
import {uploadPhotos} from "../middleware/upload.js";
import {productsCreate, productsGetByShopId, productUpdate} from "../controllers/products.controller.js";
dotenv.config()

const router = express.Router()

router.post('/create', uploadPhotos, productsCreate)
router.get('/:id', productsGetByShopId)
router.put('/:id', uploadPhotos, productUpdate)

export default router
