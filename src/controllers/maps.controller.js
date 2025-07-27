import {reverseGeocodeQueue} from "../middleware/queue.js";

export async function footWalking(req, res) {
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
        return res.json(data)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'Ошибка маршрута' })
    }
}

export async function reverseGeocode(req, res) {
    const { lat, lon, lang = "ua" } = req.body;

    if (!lat || !lon) {
        return res.status(400).json({ error: "lat and lon are required" });
    }

    await reverseGeocodeQueue.add(async () => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${lang}`, {
                method: 'GET',
                headers: {
                    "User-Agent": "MyApp/1.0 (serg27makar@gmail.com)"
                }
            });

            const data = await response.json();
            return res.json(data);
        } catch (err) {
            console.error(err);
            return res.status(500).json({error: 'Ошибка запроса к Nominatim'});
        }
    });
}

export async function fetchGeo(req, res) {
    try {
        const { query, lang } = req.body;
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=${lang}&addressdetails=1&limit=5`);
        const data = await response.json();
        return res.json(data);
    } catch (e) {
        console.error(err);
        return res.status(500).json({error: 'Ошибка запроса к fetchGeo'});
    }
}