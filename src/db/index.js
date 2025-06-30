import pg from 'pg'
const { Pool } = pg
import dotenv from 'dotenv'
dotenv.config()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

pool.on('error', (err, client) => {
    console.error('ОШИБКА В ПУЛЕ PostgreSQL:', err);
});

export async function dbConnect() {
    try {
        const client = await pool.connect()
        console.log('✅ Connected to PostgreSQL')
        client.release()
    } catch (err) {
        console.error('❌ PostgreSQL connection error:', err)
        process.exit(1)
    }
}

export default pool