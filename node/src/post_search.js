//
// [ POST - SEARCH ]
//
import * as db from './db.js'
export default async function (req, res) {
    const { collection, id } = db.getParams(req.params)
    const entry = await db.initDB(collection)
    let s = req.body || ''
    console.log(`post_search =`, s)
    const r = await db.searchCondition(entry, collection, s)
    return res.send(r)
}
