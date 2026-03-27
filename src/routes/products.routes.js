import express from 'express'
import dotenv from "dotenv";
import {uploadPhotos} from "../middleware/upload.js";
import {productsCreate} from "../controllers/products.controller.js";
dotenv.config()

const router = express.Router()

router.post('/create', uploadPhotos, productsCreate)

export default router
