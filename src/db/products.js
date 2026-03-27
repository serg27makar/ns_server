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
        `INSERT INTO photos (entity_id, r2_key, url, entity_type) VALUES ($1, $2, $3, $4)`,
        [shopId, key, url, 'product'],
        'insertImage'
    )
}
