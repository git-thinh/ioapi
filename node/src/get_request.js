
import * as db from './db.js'
export default async function (req, res) {
    const { collection, id } = db.getParams(req.params)
    const entry = await db.initDB(collection)

    let r = {};
    if (id > 0) r = await db.getItemById(entry, collection)
    else r = await db.getItems(entry, collection, id)

    return res.send(r)
}
