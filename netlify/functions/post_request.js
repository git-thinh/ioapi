//
// [ POST - EDIT - ID ]
//
import { initDB, resOPTIONS, resJson, postRequest } from './api.js'

export const handler = async (event, context, callback) => {
    if (event.httpMethod === "OPTIONS") return resOPTIONS    
    const db = await initDB(event)
    const r = await postRequest(db, event)
    return resJson(r)
}
