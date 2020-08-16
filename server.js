const express = require('express');
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io').listen(server);
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server,
    { debug: true }
)
app.use(express.static('public'))
app.use('/peer', peerServer)
io.on('connection', socket => {
    socket.on('joined-room', (roomId, id) => {
        console.log("cefe")
        socket.join(roomId)
        socket.to(roomId).broadcast.emit("user-connected", id)
        socket.on('message', (message, myId) => {
            // console.log("message")
            io.to(roomId).emit('createMessage', message,myId)
            // console.log("gbdege")
        })
    })
})
app.set("view engine", "ejs")
app.get('/', (req, res) => {

    console.log("hi")
    const uuid = uuidv4();
    res.redirect(`/${uuid}`)
})
app.get("/:room", (req, res) => {
    console.log("hello")
    res.render("room", { roomId: req.params.room })
})
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started at ${process.env.PORT || 3000}`)
});