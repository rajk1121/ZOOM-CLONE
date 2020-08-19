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
    console.log(socket.id, "************************")
    socket.on('joined-room', (roomId, id) => {
        socket.peerId = id
        console.log(socket.id, "**********/////////////*")
        var clients_in_the_room = io.sockets.adapter.rooms[roomId];
        if (clients_in_the_room) {
            console.log(clients_in_the_room['sockets'])
        }
        socket.on("remove", (peerId) => {
            socket.to(roomId).broadcast.emit("remove-it", peerId)
        })
        console.log(socket.id)
        socket.emit('users-already-joined', clients_in_the_room == undefined ? 0 : clients_in_the_room['sockets'])
        socket.join(roomId)
        socket.to(roomId).broadcast.emit("user-connected", id, socket.id)
        socket.on('message', (message, myId) => {
            // console.log("message")
            io.to(roomId).emit('createMessage', message, myId)
            // console.log("gbdege")
        })
        socket.on('disconnect', () => {
            console.log("disconnect")
            socket.to(roomId).broadcast.emit("remove-it", socket.peerId)
            var clients_in_the_room = io.sockets.adapter.rooms[roomId];
            socket.to(roomId).broadcast.emit("i-am-disconnecting", clients_in_the_room == undefined ? 0 : clients_in_the_room['sockets'])
        })
    })
})
app.set("view engine", "ejs")
app.get('/', (req, res) => {

    console.log("hi")
    const uuid = uuidv4();
    res.redirect(`/${uuid}`)
})
app.get("/leaveMeeting", (req, res) => {
    console.log("leave me***********************")
    res.render("leave")
})
app.get("/networkError", (req, res) => {
    res.render("networkError")
})
app.get("/:room", (req, res) => {
    console.log("hello888888888888888")
    res.render("room", { roomId: req.params.room })
})
server.listen(process.env.PORT || 3000, () => {
    console.log(`Server started at ${process.env.PORT || 3000}`)
});