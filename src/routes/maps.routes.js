import express from 'express'
import dotenv from 'dotenv'
import {footWalking, reverseGeocode} from "../controllers/maps.controller.js";
dotenv.config()

const router = express.Router()

router.post('/foot-walking', footWalking)
router.post('/reverse-geocode', reverseGeocode)

export default router