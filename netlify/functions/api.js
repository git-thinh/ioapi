import fs from 'node:fs'
import path from 'node:path'

import { default as axios } from 'axios'
import _ from 'lodash'

import { LowSync, MemorySync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

////////////////////////////////////////////////////

const MAX_LENGTH = 4000
const MAX_ITEMS = 1000
const MAX_FIELD = 20
global.db = null

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
    await db.read()
}

async function writeDB(db) {
    await db.write()
}

export async function initDB(event) {
    const isDev = event.rawUrl.indexOf('//localhost') > 0
    const root = isDev ? './tmp' : '/tmp'
    if (!fs.existsSync(root)) fs.mkdirSync(root)
    const file = `${root}/db.json`

    if (!global.db) {
        //global.db = new LowSync(new MemorySync(), { items: [{ _id: 1, title: 'item 1' }] })
        global.db = new LowSync(new JSONFileSync(file), { items: [{ _id: 1, title: 'item 1', price: 69 }] })
        await loadDB(global.db)
        console.log(`\n[ DB_INIT ]\n`)
    }

    //await writeDB(db)
    return global.db
}

////////////////////////////////////////////////////

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

export async function postSearch(db, event) {
    const r = { ok: true, data: [] }
    const s = event.body || ''
    //r.condition = s

    const { collection } = getParams(event)
    if (collection) {
        let a = []
        if (!db.data[collection]) db.data[collection] = []
        else a = db.data[collection] || []

        try {
            const fc = new Function('it', s)
            a = _.filter(a, fc)
            r.data = a
        } catch (e) { 
            return { ok: false, error: `ERROR_SEARCH: ${e.message}` }
        }
    }

    return r
}

export async function putItemAddnew(db, event) {
    const r = { ok: true, data: null }
    const { collection } = getParams(event)
    if (collection) {
        let a = [], id = 0

        if (!db.data[collection]) {
            db.data[collection] = []
            //await writeDB(db)
        }
        else a = db.data[collection] || []

        if (a.length > MAX_ITEMS)
            return { ok: false, error: `MAX_ITEMS > ${MAX_ITEMS}` }

        const it = JSON.parse(event.body || '{}');

        if (Object.keys(it).length > MAX_FIELD)
            return { ok: false, error: `MAX_FIELD > ${MAX_FIELD}` }
        if (JSON.stringify(it).length > MAX_LENGTH)
            return { ok: false, error: `MAX_LENGTH > ${MAX_LENGTH}` }

        const mx = _.maxBy(a, '_id');
        if (mx) { id = mx._id + 1 } else id = 1
        it._id = id

        await db.update((x) => x[collection].push(it))
        r.data = it
    }
    return r
}

export async function postItemEdit(db, event) {
    const { collection, id } = getParams(event)
    if (collection && id > 0) {
        const it = JSON.parse(event.body || '{}');
        const keys = Object.keys(it).filter((x) => x !== '_id')

        if (keys.length > MAX_FIELD)
            return { ok: false, error: `MAX_FIELD > ${MAX_FIELD}` }
        if (JSON.stringify(it).length > MAX_LENGTH)
            return { ok: false, error: `MAX_LENGTH > ${MAX_LENGTH}` }

        const a = db.data[collection] || []
        const size = a.length
        if (size > 0 && keys.length > 0) {
            let ix = a.findIndex((x) => x._id === id)
            if (ix != -1) {
                keys.forEach((name) => a[ix][name] = it[name])
                await writeDB(db)
                return { ok: true, data: a[ix] }
            }
        }
    }
    return { ok: false }
}

export async function deleteItemById(db, event) {
    const { collection, id } = getParams(event)
    if (collection && id > 0) {
        let a = db.data[collection] || []
        if (a.length > 0) {
            let r = a.filter((x) => x._id !== id)
            if (r.length !== a.length) {
                db.data[collection] = r
                await writeDB(db)
            }
        }
        return { ok: true }
    }
    return { ok: false }
}