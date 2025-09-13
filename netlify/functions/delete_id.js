//
// [ POST - EDIT - ID ]
//
import { initDB, resOPTIONS, resJson, deleteItemById } from './api.js'

export const handler = async (event, context, callback) => {
    if (event.httpMethod === "OPTIONS") return resOPTIONS
    const db = await initDB(event)
    const r = await deleteItemById(db, event)
    return resJson(r)
}
