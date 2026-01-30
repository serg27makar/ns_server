import {safeQuery} from "./query.js";

export async function insertShop(name, typeSafe, address, description) {
    const result = await safeQuery(
        `INSERT INTO shops (name, type, address, description) VALUES ($1, $2, $3, $4) RETURNING id`,
        [name, typeSafe, address, description],
        'insertShop'
    )
    return result.rows[0]
}

export async function insertImage(shopId, key, url) {
    await safeQuery(
        `INSERT INTO shop_photos (shop_id, r2_key, url) VALUES ($1, $2, $3)`,
        [shopId, key, url],
        'insertImage'
    )
}

export async function getShopById(id) {
    const result = await safeQuery(
        'SELECT id, name, type, address, description FROM shops WHERE id = $1',
        [id],
        'getShopById'
    )
    return result.rows[0]
}

export async function getShopsByUserId(userId) {
    const result = await safeQuery(
        'SELECT id, name, type, address, description FROM shops WHERE user_id = $1',
        [userId],
        'getShopByUserId'
    )
    return result.rows[0]
}

export async function getShopPhoto(id) {
    return await safeQuery(
        `SELECT id, r2_key, url FROM shop_photos WHERE shop_id = $1`,
        [id],
        "getShopPhoto"
    )
}

export async function updateShop(name, typeSafe, address, description, id) {
    await safeQuery(
        `UPDATE shops SET name = $1, type = $2, address = $3, description = $4, updated_at = NOW() WHERE id = $5`,
        [name, typeSafe, address, description, id]
    )
}

export async function getPhotoById(photoId, id) {
    return await safeQuery(
        `SELECT r2_key FROM shop_photos WHERE id = $1 AND shop_id = $2`,
        [photoId, id]
    )
}

export async function deletePhoto(photoId, id) {
    await safeQuery(
        `DELETE FROM shop_photos WHERE id = $1 AND shop_id = $2`,
        [photoId, id]
    )
}