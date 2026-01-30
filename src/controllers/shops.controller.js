import { uploadPhotoToR2 } from '../utils/s3.js'

import {
    deletePhoto,
    getPhotoById,
    getShopById,
    getShopPhoto,
    getShopsByUserId,
    insertImage,
    insertShop,
    updateShop
} from "../db/shops.js";
import {isAuth} from "../assets/core.js";

export async function shopCreate(req, res) {
    try {
        const userId = isAuth(req)
        if (!userId) return res.status(401).json({ error: 'Not authenticated' })

        const { name, type, address, description } = req.body
        const typeSafe = type && type.length ? JSON.stringify(type) : null
        const shop = await insertShop(name, typeSafe, JSON.stringify(address), description)
        const photoEntries = []

        for (const file of req.files || []) {
            const photo = await uploadPhotoToR2(file.buffer, file.originalname, file.mimetype)
            await insertImage(shop.id, photo.key, photo.url)
            photoEntries.push(photo)
        }

        return res.status(201).json({
            success: true,
            shop: {
                id: shop.id,
                name,
                type,
                address,
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

        const shopRes = await getShopsByUserId(userId.toString())
        if (!shopRes) return res.status(404).json({ error: 'Магазин не найден' })

        const photoRes = await getShopPhoto(shopRes.id)

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
        const { name, type, address, description, photoIdsToDelete = '[]' } = req.body

        const typeSafe = type && type.length ? JSON.stringify(type) : null
        const photoIds = JSON.parse(photoIdsToDelete)

        await updateShop(name, typeSafe, JSON.stringify(address), description, id)

        for (const photoId of photoIds) {
            const result = await getPhotoById(photoId, id)
            const r2Key = result.rows[0]?.r2_key
            if (r2Key) {
                await r2.deleteObject({ Bucket: process.env.R2_BUCKET, Key: r2Key }).promise()
            }
            await deletePhoto(photoId, id)
        }

        const newPhotos = []
        for (const file of req.files || []) {
            const photo = await uploadPhotoToR2(file, file.originalname)
            await insertImage(id, photo.id, photo.url)
            newPhotos.push(photo)
        }

        return res.json({ success: true, newPhotos })
    } catch (err) {
        console.error('Ошибка обновления магазина:', err)
        return res.status(500).json({ error: 'Ошибка обновления магазина' })
    }
}
