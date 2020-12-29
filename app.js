"use strict";
const path = require('path');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3004);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/canvas.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'canvas.js'));
});
app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});
var allState = [];
var id = 0;
const serverId = id;
id++;
io.on('connection', function (socket) {
    socket.emit('id', { id: id });
    if (allState.length > 0) {
        socket.emit('newpoints', { id: serverId, state: allState });
    }
    id++;
    socket.on('state', function (data) {
        if (data.id !== -1) { // -1 if client didn't get id properly
            allState = allState.concat(data.state);
        }
        console.log('ids', data.id);
        console.log("got points", data.state);
        socket.broadcast.emit('newpoints', data);
    });
    socket.on('clear', function (data) {
        socket.broadcast.emit('clear', data);
        allState.length = 0;
    })
});
