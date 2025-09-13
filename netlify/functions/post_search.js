//
// [ POST - SEARCH ]
//
import { initDB, resOPTIONS, resJson, postSearch } from './api.js'

export const handler = async (event, context, callback) => {
    if (event.httpMethod === "OPTIONS") return resOPTIONS    
    const db = await initDB(event)
    const r = await postSearch(db, event)
    return resJson(r)
}
