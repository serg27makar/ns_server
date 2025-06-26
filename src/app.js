import express from 'express'
import userRoutes from './routes/users.routes.js'
import shopRoutes from './routes/shops.routes.js'
import mapsRoutes from "./routes/maps.routes.js";
import { dbConnect } from './db/index.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors())

app.use(express.json())

app.use(cookieParser())

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${req.body}`)
    // const blockedPaths = ['/api/maps/hack']
    // if (blockedPaths.includes(req.path)) {
    //     return res.status(403).json({ error: 'Access denied' })
    // }
    next()
})

app.use('/api/users', userRoutes)
app.use('/api/shops', shopRoutes)
app.use('/api/maps', mapsRoutes)


// DB init
await dbConnect()

export default app