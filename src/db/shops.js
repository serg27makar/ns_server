import {safeQuery} from "./query.js";
const SEARCH_RADIUS_KM = 100;

export async function insertShop(name, typeSafe, address, description, lat, lng) {
    const result = await safeQuery(
        `INSERT INTO shops (name, type, address, description, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [name, typeSafe, address, description, lat, lng],
        'insertShop'
    )
    return result.rows[0]
}

export async function insertImage(entityId, key, url, entityType) {
    await safeQuery(
        `INSERT INTO photos (entity_id, r2_key, url, entity_type) VALUES ($1, $2, $3, $4)`,
        [entityId, key, url, entityType],
        'insertImage'
    )
}

export async function getShopById(id) {
    const result = await safeQuery(
        'SELECT id, name, type, address, description, location_lat, location_lng FROM shops WHERE id = $1',
        [id],
        'getShopById'
    )
    return result.rows[0]
}

export async function getShopsByUserId(userId) {
    const result = await safeQuery(
        'SELECT id, name, type, address, description, location_lat, location_lng FROM shops WHERE user_id = $1',
        [userId],
        'getShopByUserId'
    )
    return result.rows[0]
}

export async function getShopPhoto(id) {
    return await safeQuery(
        `SELECT id, r2_key, url FROM photos WHERE entity_id = $1 AND entity_type = 'shop'`,
        [id],
        "getShopPhoto"
    )
}

export async function updateShop(name, typeSafe, address, description, lat, lng, id) {
    await safeQuery(
        `UPDATE shops SET name = $1, type = $2, address = $3, description = $4, location_lat = $5, location_lng =  $6, updated_at = NOW() WHERE id = $7`,
        [name, typeSafe, address, description, lat, lng, id]
    )
}

export async function getPhotoById(photoId, id, entityType) {
    return await safeQuery(
        `SELECT r2_key FROM photos WHERE id = $1 AND entity_id = $2 AND entity_type = $3`,
        [photoId, id, entityType]
    )
}

export async function deletePhoto(photoId, id, entityType) {
    await safeQuery(
        `DELETE FROM photos WHERE id = $1 AND entity_id = $2 AND entity_type = $3`,
        [photoId, id, entityType]
    )
}

export async function deletePhotosByEntity(entityId, entityType) {
    await safeQuery(
        `DELETE FROM photos WHERE entity_id = $1 AND entity_type = $2`,
        [entityId, entityType],
        'deletePhotosByEntity'
    )
}

export async function getShops(filters = {}) {
    const { name, type, location_lat, location_lng } = filters
    let queryText = `SELECT id, name, type, address, description, location_lat, location_lng FROM shops`
    const queryParams = []
    const conditions = []

    if (name) {
        queryParams.push(`%${name}%`)
        conditions.push(`name ILIKE $${queryParams.length}`)
    }

    if (type) {
        const typeArray = Array.isArray(type) ? type : [type]
        queryParams.push(typeArray)
        conditions.push(`type && $${queryParams.length}`)
    }

    if (location_lat && location_lng) {
        const latDelta = SEARCH_RADIUS_KM / 111.1
        const lngDelta = SEARCH_RADIUS_KM / (111.1 * Math.cos(location_lat * (Math.PI / 180)))

        queryParams.push(location_lat - latDelta, location_lat + latDelta)
        const latIdxStart = queryParams.length - 1
        const latIdxEnd = queryParams.length
        conditions.push(`location_lat BETWEEN $${latIdxStart} AND $${latIdxEnd}`)

        queryParams.push(location_lng - lngDelta, location_lng + lngDelta)
        const lngIdxStart = queryParams.length - 1
        const lngIdxEnd = queryParams.length
        conditions.push(`location_lng BETWEEN $${lngIdxStart} AND $${lngIdxEnd}`)
    }

    if (conditions.length > 0) {
        queryText += ` WHERE ` + conditions.join(' AND ')
    }

    const result = await safeQuery(queryText, queryParams, 'getShops')
    return result.rows
}