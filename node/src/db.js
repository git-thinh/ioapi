import fs from 'node:fs'
import path from 'node:path'
import { default as axios } from 'axios'
import { LowSync, MemorySync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'
import _ from 'lodash'

///////////////////////////////////////////////////

global.db = {}
const MAX_FIELD = 20
const MAX_ITEMS = 1000
const MAX_LENGTH = 4000

export async function initDB(collection) {
    if (!global.db[collection]) {
        //global.db[collection] = new LowSync(new MemorySync(), { items: [{ _id: 1, title: 'item 1' }] })

        if (!fs.existsSync('./db')) fs.mkdirSync('./db')
        global.db[collection] = new LowSync(new JSONFileSync(`./db/${collection}.json`), { items: [{ _id: 1, title: 'item 1', price: 69 }] })

        await loadDB(global.db[collection])

        console.log(`\n[ DB_INIT = ${collection} ]\n`)
    }
    return global.db[collection]
}

export async function loadDB(entry) {
    await entry.read()
}

export async function writeDB(entry) {
    await entry.write()
}

///////////////////////////////////////////////////

export function getParams(params) {
    const collection = params.collection || ''
    let id = Number(params.id || '0')
    if (isNaN(id)) id = 0
    console.log(`\n|-> collection = ${collection}, id = ${id}`)
    return { collection, id }
}

export async function getItems(entry, collection) {
    const r = { ok: true, data: [] }
    if (collection) r.data = entry.data[collection] || []
    return r
}

export async function getItemById(entry, collection, id) {
    const r = { ok: true, data: null }
    if (collection && id > 0) {
        const a = entry.data[collection] || []
        r.data = a.find((x) => x._id === id)
    }
    return r
}

export async function searchCondition(entry, collection, condition) {
    const r = { ok: true, data: [] }
    if (collection) {
        let a = []
        if (!entry.data[collection]) entry.data[collection] = []
        else a = entry.data[collection] || []

        try {
            const fc = new Function('it', condition)
            a = _.filter(a, fc)
            r.data = a
        } catch (e) {
            return { ok: false, error: `ERROR_SEARCH: ${e.message}` }
        }
    }
    return r
}

export async function itemAddnew(entry, collection, item) {
    const r = { ok: true, data: null }
    if (collection) {
        let a = [], id = 0

        if (!entry.data[collection]) entry.data[collection] = []
        else a = entry.data[collection] || []

        if (a.length > MAX_ITEMS)
            return { ok: false, error: `MAX_ITEMS > ${MAX_ITEMS}` }

        const it = item || {}
        const countField = Object.keys(it).filter(x => x !== '_id')

        if (countField === 0)
            return { ok: false, error: `Fields is empty` }
        if (countField > MAX_FIELD)
            return { ok: false, error: `MAX_FIELD > ${MAX_FIELD}` }
        if (JSON.stringify(it).length > MAX_LENGTH)
            return { ok: false, error: `MAX_LENGTH > ${MAX_LENGTH}` }

        const mx = _.maxBy(a, '_id');
        if (mx) { id = mx._id + 1 } else id = 1
        it._id = id

        await entry.update((x) => x[collection].push(it))
        r.data = it
    }
    return r
}

export async function itemEdit(entry, collection, id, item) {
    if (collection && id > 0) {
        const it = item || {};
        const keys = Object.keys(it).filter((x) => x !== '_id')

        if (keys.length === 0)
            return { ok: false, error: `Fields is empty` }
        if (keys.length > MAX_FIELD)
            return { ok: false, error: `MAX_FIELD > ${MAX_FIELD}` }
        if (JSON.stringify(it).length > MAX_LENGTH)
            return { ok: false, error: `MAX_LENGTH > ${MAX_LENGTH}` }

        const a = entry.data[collection] || []
        const size = a.length
        if (size > 0 && keys.length > 0) {
            let ix = a.findIndex((x) => x._id === id)
            if (ix != -1) {
                keys.forEach((name) => a[ix][name] = it[name])
                await writeDB(entry)
                return { ok: true, data: a[ix] }
            }
        }
    }
    return { ok: false }
}

export async function deleteItemById(entry, collection, id) {
    if (collection && id > 0) {
        let a = entry.data[collection] || []
        if (a.length > 0) {
            let r = a.filter((x) => x._id !== id)
            if (r.length !== a.length) {
                entry.data[collection] = r
                await writeDB(entry)
            }
        }
        return { ok: true }
    }
    return { ok: false }
}