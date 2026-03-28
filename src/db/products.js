import {safeQuery} from "./query.js";

export async function insertProduct( name, price, shopId, description) {
    const result = await safeQuery(
        `INSERT INTO product ( name, price, shop_id, description) VALUES ($1, $2, $3, $4) RETURNING id`,
        [ name, price, shopId, description],
        'insertProduct'
    )
    return result.rows[0]
}

export async function getProductsByShopsId(shopId) {
    const result = await safeQuery(
        'SELECT id, name, price, description FROM product WHERE shop_id = $1',
        [shopId],
        'getProductsByShopsId'
    )
    return result.rows
}

export async function getProductPhoto(id) {
    return await safeQuery(
        `SELECT id, r2_key, url FROM photos WHERE entity_id = $1 AND entity_type = 'product'`,
        [id],
        "getProductPhoto"
    )
}

export async function updateProduct(name, price, description, id) {
    await safeQuery(
        `UPDATE product SET name = $1, price = $2, description = $3, updated_at = NOW() WHERE id = $4`,
        [name, price, description, id]
    )
}
