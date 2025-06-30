import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
    userExists,
    findUserByPhone,
    createUser,
    getUserById
} from '../db/users.js'
import { COOKIE_NAME } from '../assets/constants.js'
import { signTokenFromUser, getTokenFromRequest, setAuthCookie } from '../utils/auth.js'
import { requireFields } from '../utils/validators.js'

export async function registerUser(req, res) {
    if (!requireFields(['name', 'phone', 'password', 'userType'], req.body, res)) return

    try {
        const { name, phone, password, userType } = req.body

        if (await userExists(phone)) {
            return res.status(409).json({ error: 'A user with this number already exists.' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await createUser(name, phone, hashedPassword, userType)
        const token = signTokenFromUser(user)

        setAuthCookie(res, token)
        return res.status(201).json({ user })
    } catch (err) {
        console.error('Registration error:', err)
        return res.status(500).json({ error: 'Server error' })
    }
}

export async function loginUser(req, res) {
    if (!requireFields(['phone', 'password'], req.body, res)) return

    try {
        const { phone, password } = req.body
        const user = await findUserByPhone(phone)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(401).json({ error: 'Incorrect password' })
        }

        const token = signTokenFromUser(user)
        delete user.password

        setAuthCookie(res, token)
        return res.json({ user })
    } catch (err) {
        console.error('Login error:', err)
        return res.status(500).json({ error: 'Server error' })
    }
}

export function logoutUser(req, res) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    })
    return res.json({ message: 'You have been logged out.' })
}

export async function checkStatus(req, res) {
    try {
        const token = getTokenFromRequest(req)
        if (!token) return res.status(401).json({ message: 'Not authenticated' })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await getUserById(decoded.id)
        if (!user) return res.status(401).json({ message: 'User not found' })

        return res.json({ user })
    } catch (error) {
        console.error('Status check failed:', error)
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}
