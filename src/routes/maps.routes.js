import express from 'express'
import { mockAuth } from '../middleware/auth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.post('/foot-walking', mockAuth, async (req, res) => {
    const API_KEY = process.env.ORS_API_KEY

    try {
        const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                coordinates: req.body.coordinates,
                instructions: req.body.instructions,
                geometry: req.body.geometry,
                elevation: req.body.elevation

            })
        })

        const data = await response.json()
        res.json(data)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Ошибка маршрута' })
    }
})

export default router