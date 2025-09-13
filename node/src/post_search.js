//
// [ POST - SEARCH ]
//
import * as db from './db.js'
export default async function (req, res) {
    const { collection, id } = db.getParams(req.params)
    const entry = await db.initDB(collection)
    const r = await db.searchCondition(entry, collection, req.body)
    return res.send(r)
}
