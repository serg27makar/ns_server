import express from 'express'
import { mockAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', mockAuth, (req, res) => {
    res.json({ message: '🏪 List of shops (stub)', user: req.user })
})

export default router