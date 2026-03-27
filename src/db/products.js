import {safeQuery} from "./query.js";

export async function insertProduct( name, price, shopId, description) {
    const result = await safeQuery(
        `INSERT INTO product ( name, price, shop_id, description) VALUES ($1, $2, $3, $4) RETURNING id`,
        [ name, price, shopId, description],
        'insertProduct'
    )
    return result.rows[0]
}
