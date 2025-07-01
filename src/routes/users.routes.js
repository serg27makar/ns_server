import express from 'express'
import {
    registerUser,
    loginUser,
    logoutUser,
    checkStatus,
    updateUserProfile,
} from '../controllers/users.controller.js'

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logoutUser)
router.get('/status', checkStatus)
router.get('/profile', checkStatus)
router.put('/update', updateUserProfile)

export default router
