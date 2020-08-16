let isChatOpen = false;
let isParticipantOpen = false;
const myVideo = document.createElement("video")
myVideo.muted = true
const roomId = "<%= roomId %>"
let myVideoStream;
var myId
var globalSocket
var globalPeer
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)
    const socket = io()
    var peer = new Peer(undefined, {
        path: '/peer',
        host: '/',
        port: '443'
    });
    globalSocket = socket
    globalPeer = peer
    socket.on('connect', () => {
        adddParticipants(socket.id + " (Me)")
    });
    socket.on('users-already-joined', data => {
        if (data) {
            console.log(data)
            for (socketId in data) {
                adddParticipants(socketId)
            }
        }
    })
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
    socket.on('i-am-disconnecting', data => {
        document.querySelector('.participants').innerHTML = ''
        adddParticipants(socket.id + " (Me)")
        if (data) {
            // console.log(data)

            for (socketId in data) {
                if (socket.id != socketId)
                    adddParticipants(socketId)
            }
        }
    })
    socket.on("user-connected", (userId, socketId) => {
        adddParticipants(socketId)
        var call = peer.call(userId, stream);
        console.log("calling")
        const video = document.createElement("video")
        call.on('stream', function (remoteStream) {
            addVideoStream(video, remoteStream)
        });
        console.log("user joined", userId)
    })
    socket.on('createMessage', (message, myId) => {
        console.log("create messagem", message)
        $('.messages').append(`<li class="message"><span>User (${myId})</span><br> ${message}</li>`)
        scrollToBottom();
    })
    peer.on('open', id => {
        console.log(id)
        myId = id
        socket.emit('joined-room', roomId, id)
    })
    const text = $('input');
    $('html').keydown(e => {
        console.log(myId)
        if (e.which == 13 && text.val().length != 0) {
            console.log(text.val())
            socket.emit('message', text.val(), socket.id)
            text.val('')
        }
    })

}).catch(() => {

})
const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
        // console.log("vdee")
    })
    document.querySelector("#video-grid").append(video)
}
const scrollToBottom = () => {
    let d = $('.main__chat_window')
    d.scrollTop(d.prop('scrollHeight'))
}
const muteUnmute = () => {
    const isEnabled = myVideoStream.getAudioTracks()[0].enabled;
    if (isEnabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;

    }
}
const setMuteButton = () => {
    let html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html
}
const setUnmuteButton = () => {
    let html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html

}
const stopUnstop = () => {
    const isEnabled = myVideoStream.getVideoTracks()[0].enabled;
    if (isEnabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setUnstopButton();
    } else {
        setStopButton();
        myVideoStream.getVideoTracks()[0].enabled = true;

    }
}
const setStopButton = () => {
    let html = `
        <i class="fas fa-video"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__stop_button').innerHTML = html
}
const setUnstopButton = () => {
    let html = `
        <i class="unstop fas fa-video-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__stop_button').innerHTML = html

}
const openChat = () => {
    if (isChatOpen) {

        $('.main__right').css('display', "none")
        $('.main__left').css("flex", "1.0")
        isChatOpen = !isChatOpen
    } else {

        $('.main__extreme_right').css('display', "none")
        $('.main__right').css('display', "flex")
        $('.main__left').css("flex", "0.8")
        isChatOpen = !isChatOpen
        if (isParticipantOpen) {

            isParticipantOpen = !isParticipantOpen
        }
    }
}
const openParticipants = () => {
    if (isParticipantOpen) {

        $('.main__right').css('display', "none")
        $('.main__extreme_right').css('display', "none")
        $('.main__left').css("flex", "1.0")
        isParticipantOpen = !isParticipantOpen
    } else {

        $('.main__right').css('display', "none")
        $('.main__extreme_right').css('display', "flex")
        $('.main__left').css("flex", "0.8")
        if (isChatOpen) {

            isChatOpen = !isChatOpen
        }
        isParticipantOpen = !isParticipantOpen
    }
}
const adddParticipants = (id) => {
    let html = `<li class="real_participants">${id}</li>`
    $('.participants').append(html)
}
const leaveMeeting = () => {
    globalSocket.disconnect();
    globalPeer.destroy();
}