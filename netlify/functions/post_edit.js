//
// [ POST - EDIT - ID ]
//
import { initDB, resOPTIONS, resJson, postItemEdit } from './api.js'

export const handler = async (event, context, callback) => {
    if (event.httpMethod === "OPTIONS") return resOPTIONS    
    const db = await initDB(event)
    const r = await postItemEdit(db, event)
    return resJson(r)
}
