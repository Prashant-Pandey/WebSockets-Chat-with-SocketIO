var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
let userSet = new Set();

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

io.on('connection', (socket) => {
    socket.on("check-username", (username) => {
        if (userSet.has(username)) {
            socket.emit('invalid-username', "");
        } else {
            userSet.add(username);
            socket.userId = username;
            socket.emit("valid-username", username);
            socket.broadcast.emit("user-connected", username);
        }
    });

    socket.on("typing-over", (username) => {
        socket.broadcast.emit("typing-over", username);
    })

    socket.on("user-is-typing", (username) => {
        socket.broadcast.emit("user-is-typing", username);
    })

    socket.on("chat-message", (obj) => {
        socket.broadcast.emit("chat-message", obj);
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", socket.userId)
        userSet.delete(socket.userId);
    })
});


http.listen(3000, () => {
    console.log('listening on *:3000');
});