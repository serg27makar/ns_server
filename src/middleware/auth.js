export function mockAuth(req, res, next) {
    // Симулируем пользователя, например, admin
    req.user = { id: 1, role: 'admin' }
    next()
}
