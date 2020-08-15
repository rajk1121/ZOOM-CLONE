console.log("geheehhe")
const myVideo = document.createElement("video")
myVideo.muted = true
const roomId = "<%= roomId %>"
let myVideoStream;
let myId
const socket = io()
var peer = new Peer(undefined, {
    path: '/peer',
    host: '/',
    port: 3000,
    secure: false
});
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    peer.on('call', (call) => {
        console.log("answering")
        call.answer(stream); // Answer the call with an A/V stream.
        // console.log(otherId)
        const video = document.createElement("video")
        call.on('stream', function (remoteStream) {
            // Show stream in some video/canvas element.
            addVideoStream(video, remoteStream)
        });
    })

    socket.on("user-connected", (userId) => {
        var call = peer.call(userId, stream);
        console.log("calling")
        const video = document.createElement("video")
        call.on('stream', function (remoteStream) {
            addVideoStream(video, remoteStream)
        });
        console.log("user joined", userId)
    })
})
peer.on('open', id => {
    console.log(id)
    myId = id
    socket.emit('joined-room', roomId, id)
})
const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
        // console.log("vdee")
    })
    document.querySelector("#video-grid").append(video)
}