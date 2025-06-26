import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
    userExists,
    findUserByPhone,
    createUser
} from '../db/users.js'
import {COOKIE_NAME} from "../assets/constants.js";

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '2h'

router.post('/register', async (req, res) => {
    const { name, phone, password } = req.body

    if (!name || !phone || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' })
    }

    try {
        if (await userExists(phone)) {
            return res.status(409).json({ error: 'Пользователь с таким номером уже существует' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await createUser(name, phone, hashedPassword)

        const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 2
        })

        res.status(201).json({ user })
    } catch (err) {
        console.error('Ошибка регистрации:', err)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

router.post('/login', async (req, res) => {
    const { phone, password } = req.body

    if (!phone || !password) {
        return res.status(400).json({ error: 'Номер телефона и пароль обязательны' })
    }

    try {
        const user = await findUserByPhone(phone)
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' })
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            return res.status(401).json({ error: 'Неверный пароль' })
        }

        const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 2
        })

        delete user.password

        res.json({ user })
    } catch (err) {
        console.error('Ошибка входа:', err)
        res.status(500).json({ error: 'Ошибка сервера' })
    }
})

router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    })
    res.json({ message: 'Вы вышли из системы' })
})

export default router
