import express from 'express'
import {getUserShops, shopCreate, shopGetById, shopUpdate} from "../controllers/shops.controller.js";
import dotenv from "dotenv";
import {uploadPhotos} from "../middleware/upload.js";
dotenv.config()

const router = express.Router()

router.post('/create', uploadPhotos, shopCreate)
router.get('/profile', getUserShops)
router.get('/:id', shopGetById)
router.put('/:id', uploadPhotos, shopUpdate)

export default router
