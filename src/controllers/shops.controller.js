import { uploadPhotoToR2, deletePhotoFromR2 } from '../utils/s3.js'

import {
    deletePhoto,
    getPhotoById,
    getShopById,
    getShopPhoto,
    getShopsByUserId,
    getShops,
    insertImage,
    insertShop,
    updateShop
} from "../db/shops.js";
import {isAuth} from "../assets/core.js";

export async function shopCreate(req, res) {
    try {
        const userId = await isAuth(req)
        if (!userId) return res.status(401).json({ error: 'Not authenticated' })

        const { name, type, address, description, location } = req.body
        const types = JSON.parse(type)
        const typeSafe = types.map((t) => t.id)
        const { lat, lng } = JSON.parse(location)
        const shop = await insertShop(name, typeSafe, address, description, lat, lng)
        const photoEntries = []

        for (const file of req.files || []) {
            const photo = await uploadPhotoToR2(file.buffer, file.originalname, file.mimetype)
            await insertImage(shop.id, photo.key, photo.url, "shop")
            photoEntries.push(photo)
        }

        return res.status(201).json({
            success: true,
            shop: {
                id: shop.id,
                name,
                type,
                address,
                location_lat: lat,
                location_lng: lng,
                description,
                photos: photoEntries,
                userId
            },
        })
    } catch (err) {
        console.error('Ошибка создания магазина:', err)
        return res.status(500).json({ error: 'Ошибка создания магазина' })
    }
}

export async function shopGetById(req, res) {
    try {
        const { id } = req.params
        const shopRes = await getShopById(id)
        if (!shopRes) return res.status(404).json({ error: 'Магазин не найден' })
        const photoRes = await getShopPhoto(id)

        shopRes.address = shopRes.address ? JSON.parse(shopRes.address) : []

        return res.json({
            ...shopRes,
            photos: photoRes.rows,
        })
    } catch (err) {
        console.error('Ошибка получения магазина:', err)
        return res.status(500).json({ error: 'Ошибка получения магазина' })
    }
}

export async function getUserShops(req, res) {
    try {
        const userId = await isAuth(req)
        if (!userId) return res.status(401).json({ error: 'Not authenticated' })

        const shopRes = await getShopsByUserId(userId)
        if (!shopRes) return res.status(404).json({ error: 'Магазин не найден' })

        const photoRes = await getShopPhoto(shopRes.id)

        shopRes.address = shopRes.address ? JSON.parse(shopRes.address) : []

        return res.json({
            ...shopRes,
            photos: photoRes.rows,
        })
    } catch (err) {
        console.error('Ошибка получения магазина:', err)
        return res.status(500).json({ error: 'Ошибка получения магазина' })
    }
}

export async function shopUpdate(req, res) {
    try {
        const { id } = req.params
        const { name, type, address, description, location, photoIdsToDelete = '[]' } = req.body
        const { lat, lng } = JSON.parse(location)

        const types = JSON.parse(type)
        const typeSafe = types.map((t) => t.id)
        const photoIds = JSON.parse(photoIdsToDelete)

        await updateShop(name, typeSafe, address, description, lat, lng, id)

        const deletedPhotos = []
        for (const photoId of photoIds) {
            const result = await getPhotoById(photoId, id, "shop")
            const r2Key = result.rows[0]?.r2_key

            if (r2Key) {
                await deletePhotoFromR2(r2Key)
            }

            await deletePhoto(photoId, id, "shop")
            deletedPhotos.push(photoId)
        }

        const newPhotos = []
        for (const file of req.files || []) {
            const photo = await uploadPhotoToR2(file.buffer, file.originalname, file.mimetype)
            await insertImage(id, photo.key, photo.url, "shop")
            newPhotos.push(photo)
        }

        return res.json({
            success: true,
            deletedPhotos,
            newPhotos,
        })
    } catch (err) {
        console.error('Ошибка обновления магазина:', err)
        return res.status(500).json({ error: 'Ошибка обновления магазина' })
    }
}

export async function shopList(req, res) {
    try {
        const { name, type, location_lat, location_lng } = req.query
        const filters = {}

        if (name) filters.name = name
        if (type) {
            try {
                filters.type = JSON.parse(type)
            } catch (e) {
                filters.type = type
            }
        }
        if (location_lat) filters.location_lat = parseFloat(location_lat)
        if (location_lng) filters.location_lng = parseFloat(location_lng)

        const shops = await getShops(filters)
        shops.map(shop => {
            shop.address = shop.address ? JSON.parse(shop.address) : null
            return shop
        })

        return res.json(shops)
    } catch (err) {
        console.error('Ошибка получения списка магазинов:', err)
        return res.status(500).json({ error: 'Ошибка получения списка магазинов' })
    }
}