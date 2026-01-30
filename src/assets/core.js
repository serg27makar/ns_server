import jwt from "jsonwebtoken";

export const getUserId = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.id
}

export const isAuth = async (req) => {
    const token = req.cookies?.access_token
    if (!token) return false

    try {
        return getUserId(token)
    } catch (error) {
        return false
    }
}