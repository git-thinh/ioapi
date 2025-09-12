
import { initDB, resOPTIONS, resJson, getRequest } from './api.js'

export const handler = async (event, context, callback) => {
    if (event.httpMethod === "OPTIONS") return resOPTIONS
    const db = await initDB(event)
    const r = await getRequest(db, event)
    return resJson(r)
}