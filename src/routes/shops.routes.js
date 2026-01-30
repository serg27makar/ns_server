import express from 'express'
import {shopCreate, shopGetById, shopUpdate} from "../controllers/shops.controller.js";
import dotenv from "dotenv";
import {uploadPhotos} from "../middleware/upload.js";
dotenv.config()

const router = express.Router()

router.post('/create', uploadPhotos, shopCreate)
router.get('/:id', shopGetById)
router.put('/:id', uploadPhotos, shopUpdate)

export default router
