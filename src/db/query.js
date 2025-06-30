import pool from './index.js'

export async function safeQuery(text, params = [], debugLabel = 'SQL') {
    const client = await pool.connect()
    try {
        const result = await client.query(text, params)
        return result
    } catch (err) {
        console.error(`❌ Ошибка в запросе [${debugLabel}]:`, err)
        throw err
    } finally {
        client.release()
    }
}
