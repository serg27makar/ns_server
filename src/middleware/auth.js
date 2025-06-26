import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET

export function mockAuth(req, res, next) {
    const token = req.cookies.token
    console.log(req.cookies)
    if (!token) return res.status(401).json({ error: 'Нет токена' })

    try {
        const user = jwt.verify(token, JWT_SECRET)
        req.user = user
        next()
    } catch {
        res.status(401).json({ error: 'Невалидный токен' })
    }
}
