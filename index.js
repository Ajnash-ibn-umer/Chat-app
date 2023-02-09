const express = require('express')
const http = require('http')
const path = require('path')
const { Server } = require('socket.io')
const { fileURLToPath } = require('url')
const redis = require('redis')

const client = redis.createClient()
client.connect()
const app = express()
const PORT = 8000


app.set('view engine', 'ejs')

const server = http.createServer(app)
const io = new Server(server).listen(server)
const sendMessage = (async (socket) => {
    const messages = await client.lRange('messages', '0', '-1')
    console.log({ messages });
    messages.map((data) => {
        const str = data.split(':')
        const fromUser = str[0]
        const msgUser = str[1]
        console.log({fromUser},{msgUser});
        socket.emit('messageto', { from :fromUser, msg:msgUser })
    })
})
app.get('/', (req, res) => {
    res.render('index.ejs')
})

io.on('connection', async (socket) => {
    sendMessage(socket)

    socket.on('message', async ({ msg, from }) => {
        console.log(from + ' : ' + msg);
        await client.rPush('messages', `${from} : ${msg}`)

        io.emit('messageto', { from, msg })
    })
})
app.get('/chat', (req, res) => {
    console.log(req.query.username);
    const username = req.query.username

    io.emit('joined', username)
    io.on('message', (value) => {
        console.log({ value });
    })
    res.render('chat', { username })
})
server.listen(PORT, () => {
    console.log('server at', PORT);
})