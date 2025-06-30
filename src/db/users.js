import { safeQuery } from './query.js'

export async function findUserByPhone(phone) {
    const result = await safeQuery(
        'SELECT id, name, phone, password, user_type as UserType FROM users WHERE phone = $1',
        [phone],
        'findUserByPhone'
    )
    return result.rows[0]
}

export async function userExists(phone) {
    const result = await safeQuery('SELECT id FROM users WHERE phone = $1', [phone], 'userExists')
    return result.rows.length > 0
}

export async function createUser(name, phone, hashedPassword, user_type) {
    const result = await safeQuery(
        'INSERT INTO users (name, phone, password, user_type) VALUES ($1, $2, $3, $4) RETURNING id, name, phone, user_type as UserType',
        [name, phone, hashedPassword, user_type],
        'createUser'
    )
    return result.rows[0]
}

export async function getUserById(id) {
    const result = await safeQuery('SELECT id, name, phone, user_type as UserType FROM users WHERE id = $1', [id], 'getUserById')
    return result.rows[0]
}
