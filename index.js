const express = require('express')
const http = require('http')
const path = require('path')
const { Server } = require('socket.io')
const { fileURLToPath } = require('url')
const redis =require('redis')

const client=redis.createClient()

const app = express()
const PORT = 8000


app.set('view engine', 'ejs')

const server = http.createServer(app)
const io = new Server(server).listen(server)

app.get('/', (req, res) => {
    res.render('index.ejs')
})
io.on('connection', (socket) => {
    socket.on('message', ({ msg, from }) => {
        console.log(from + ' : ' + msg);
        client.rPush('messages',`${from} : ${msg}`)

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