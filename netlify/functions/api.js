import fs from 'node:fs'
import path from 'node:path'
import { default as axios } from 'axios'

//import { LowSync, MemorySync } from 'lowdb'
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

const MAX_LENGTH = 4000
const MAX_ITEMS = 1000
const MAX_FIELD = 20

export const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "*",
};

export const resOPTIONS = {
    statusCode: 200,
    headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
    },
    body: '{}'
}

////////////////////////////////////////////////////

export function resJson(data) {
    let s = data, t = typeof data
    if (t == 'object') s = JSON.stringify(data)
    return {
        statusCode: 200,
        headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json',
        },
        body: s,
    }
}

function getParams(event) {
    let collection = '', id = 0
    const a = event.path.split('/')
    switch (a.length) {
        case 4:
            collection = a[3]
            break
        case 5:
        case 6:
        case 7:
            collection = a[3]
            id = Number(a[4])
            if (isNaN(id)) id = 0
            break
    }
    console.log(`\n[ ${event.httpMethod} ] ${event.path} -> collection = ${collection}, id = ${id}`)
    return { collection, id }
}

////////////////////////////////////////////////////

async function loadDB(db) {
    db.read()
    //await db.read()
}

async function writeDB(db) {
    db.write()
    //await db.write()
}

export async function initDB(event) {
    const isDev = event.rawUrl.indexOf('//localhost') > 0
    const root = isDev ? './tmp' : '/tmp'
    if (!fs.existsSync(root)) fs.mkdirSync(root)
    const file = `${root}/db.json`

    //const db = new LowSync(new MemorySync(), { items: [{ _id: '1', title: 'item 1' }] })
    const db = new LowSync(new JSONFileSync(file), { items: [{ _id: 1, title: 'item 1' }] })
    if (fs.existsSync(file)) await loadDB()
    //await writeDB(db)

    return db
}

export async function getRequest(db, event) {
    const r = { ok: true, data: null }
    const { collection, id } = getParams(event)
    if (collection) {
        let a = db.data[collection] || []
        if (id > 0) r.data = a.find((x) => x._id === id)
        else r.data = a
    }
    return r
}

export async function postRequest(db, event) {
    const r = { ok: true }
    return r
}

export async function putItemAddnew(db, event) {
    const r = { ok: true, data: null }
    const { collection, id } = getParams(event)
    if (collection) {
        let a = []

        if (!db.data[collection]) {
            db.data[collection] = []
            await writeDB(db)
        }
        else a = db.data[collection] || []

        if (a.length > MAX_ITEMS)
            return { ok: false, error: `MAX_ITEMS > ${MAX_ITEMS}` }

        const it = JSON.parse(event.body || '{}');
        it._id = String(a.length + 1)

        if (Object.keys(it).length > MAX_FIELD)
            return { ok: false, error: `MAX_FIELD > ${MAX_FIELD}` }
        if (JSON.stringify(it).length > MAX_LENGTH)
            return { ok: false, error: `MAX_LENGTH > ${MAX_LENGTH}` }

        await db.update((x) => x[collection].push(it))
    }
    return r
}

export async function postItemEdit(db, event) {
    const r = { ok: true, data: null }
    const { collection, id } = getParams(event)
    if (collection) {
        let a = []

        if (!db.data[collection]) {
            db.data[collection] = []
            await writeDB(db)
        }
        else a = db.data[collection] || []

        if (a.length > MAX_ITEMS)
            return { ok: false, error: `MAX_ITEMS > ${MAX_ITEMS}` }

        const it = req.body || {}
        it._id = String(a.length + 1)

        if (Object.keys(it).length > MAX_FIELD)
            return { ok: false, error: `MAX_FIELD > ${MAX_FIELD}` }
        if (JSON.stringify(it).length > MAX_LENGTH)
            return { ok: false, error: `MAX_LENGTH > ${MAX_LENGTH}` }

        await db.update((x) => x[collection].push(it))
    }
    return r
}

export async function deleteItemById(db, event) {
    const r = { ok: true }
    return r
}