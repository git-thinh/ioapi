//
// [ DELETE - ITEM - ID ]
//
import * as db from './db.js'
export default async function (req, res) {
    const { collection, id } = db.getParams(req.params)
    const entry = await db.initDB(collection)
    const r = await db.deleteItemById(entry, collection, id)
    return res.send(r)
}
