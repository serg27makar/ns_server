import {isAuth} from "../assets/core.js";
import {insertImage} from "../db/shops.js";
import {uploadPhotoToR2} from "../utils/s3.js";
import {insertProduct} from "../db/products.js";


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
