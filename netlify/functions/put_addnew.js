//
// [ PUT - ADDNEW ]
//
import { initDB, resOPTIONS, resJson } from './api.js'

export const handler = async (event, context, callback) => {
    if (event.httpMethod === "OPTIONS") return resOPTIONS    
    const db = await initDB(event)
    const r = await getItems(db, event)
    return resJson(r)
}
