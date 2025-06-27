export function requireFields(fields, body, res) {
    for (const field of fields) {
        if (!body[field]) {
            res.status(400).json({ error: `Поле "${field}" обязательно` })
            return false
        }
    }
    return true
}
