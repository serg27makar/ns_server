import pool from './index.js'

export async function findUserByPhone(phone) {
    const result = await pool.query(
        'SELECT id, name, phone, password FROM users WHERE phone = $1',
        [phone]
    )
    return result.rows[0]
}

export async function userExists(phone) {
    const result = await pool.query('SELECT id FROM users WHERE phone = $1', [phone])
    return result.rows.length > 0
}

export async function createUser(name, phone, hashedPassword) {
    const result = await pool.query(
        'INSERT INTO users (name, phone, password) VALUES ($1, $2, $3) RETURNING id, name, phone',
        [name, phone, hashedPassword]
    )
    return result.rows[0]
}

export async function getUserById(id) {
    const result = await pool.query('SELECT id, name, phone FROM users WHERE id = $1', [id])
    return result.rows[0]
}
