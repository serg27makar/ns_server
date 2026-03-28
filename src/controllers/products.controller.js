import {isAuth} from "../assets/core.js";
import {deletePhoto, getPhotoById, insertImage} from "../db/shops.js";
import {deletePhotoFromR2, uploadPhotoToR2} from "../utils/s3.js";
import {getProductPhoto, getProductsByShopsId, insertProduct, updateProduct} from "../db/products.js";

export async function productsCreate(req, res) {
    try {
        const userId = isAuth(req)
        if (!userId) return res.status(401).json({ error: 'Not authenticated' })

        const { name, price, shopId, description } = req.body
        const product = await insertProduct( name, price, shopId, description )
        const photoEntries = []

        for (const file of req.files || []) {
            const photo = await uploadPhotoToR2(file.buffer, file.originalname, file.mimetype)
            await insertImage(product.id, photo.key, photo.url, "product")
            photoEntries.push(photo)
        }

        return res.status(201).json({
            success: true,
            product: {
                id: product.id,
                shopId,
                name,
                price,
                description,
                photos: photoEntries,
                userId
            },
        })
    } catch (err) {
        console.error('Ошибка создания товара:', err)
        return res.status(500).json({ error: 'Ошибка создания товара' })
    }
}

export async function productsGetByShopId(req, res) {
    try {
        const shopId = req.params.id
        const products = await getProductsByShopsId(shopId)
        if (!products || products.length === 0) return res.status(404).json({ error: 'Товары не найдены' })

        for (const product of products) {
            const photoResult = await getProductPhoto(product.id)
            product.photos = photoResult.rows
        }

        return res.status(200).json(products)
    } catch (err) {
        console.error('Ошибка получения товаров по id магазина:', err)
        return res.status(500).json({ error: 'Ошибка получения товаров по id магазина' })
    }
}

export async function productUpdate(req, res) {
    try {
        const { id } = req.params
        const { name, price, description, photoIdsToDelete = '[]' } = req.body

        const photoIds = JSON.parse(photoIdsToDelete)

        await updateProduct(name, price, description, id)

        const deletedPhotos = []
        for (const photoId of photoIds) {
            const result = await getPhotoById(photoId, id, "product")
            const r2Key = result.rows[0]?.r2_key

            if (r2Key) {
                await deletePhotoFromR2(r2Key)
            }

            await deletePhoto(photoId, id, "product")
            deletedPhotos.push(photoId)
        }

        const newPhotos = []
        for (const file of req.files || []) {
            const photo = await uploadPhotoToR2(file.buffer, file.originalname, file.mimetype)
            await insertImage(id, photo.key, photo.url, "product")
            newPhotos.push(photo)
        }

        return res.json({
            success: true,
            deletedPhotos,
            newPhotos,
        })

    } catch (err) {
        console.error('Ошибка обновления товара:', err)
        return res.status(500).json({ error: 'Ошибка обновления товара' })
    }
}