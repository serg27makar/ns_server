import jwt from 'jsonwebtoken'
import {COOKIE_NAME, JWT_EXPIRES_IN} from "../assets/constants.js";

export function signTokenFromUser(user) {
    return jwt.sign(
        { id: user.id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    )
}

export function getTokenFromRequest(req) {
    return req.cookies?.access_token
}

export function setAuthCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60 * 2,
    })
}
