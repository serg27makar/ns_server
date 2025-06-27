import express from 'express'
import {
    registerUser,
    loginUser,
    logoutUser,
    checkStatus,
} from '../controllers/users.controller.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/status', checkStatus)

export default router
