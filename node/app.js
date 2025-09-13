let HTTP_PORT = 6363

import express from 'express'
import cors from 'cors'

console.log(`[ API = http://::${HTTP_PORT} ]`)

import io_delete_id from './src/delete_id.js'
import io_get_request from './src/get_request.js'
import io_post_edit from './src/post_edit.js'
import io_post_search from './src/post_search.js'
import io_put_addnew from './src/put_addnew.js'

///////////////////////////////////////////////////////
const app = express()
app.use(cors())
//app.use(express.json())
app.get('/', (req, res) => res.send('OK'));

//----------------------------------------------------
// [ API ]

app.get('/io/get/:collection', async (req, res) => await io_get_request(req, res))
app.get('/io/get/:collection/:id', async (req, res) => await io_get_request(req, res))

app.put('/io/put/:collection', express.json(), async (req, res) => await io_put_addnew(req, res))

app.post('/io/post-edit/:collection/:id', express.json(), async (req, res) => await io_post_edit(req, res))

app.post('/io/post-search/:collection', express.text(), async (req, res) => await io_post_search(req, res))

app.delete('/io/delete/:collection/:id', express.json(), async (req, res) => await io_delete_id(req, res))

//----------------------------------------------------
const server = app.listen(HTTP_PORT, () => console.log(`[ RUNNING ]\n\n`))