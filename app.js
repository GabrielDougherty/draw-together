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
var allPoints = [];
var id = 0;
io.on('connection', function (socket) {
    socket.emit('id', { id: id });
    if (allPoints.length > 0) {
        socket.emit('newpoints', { id: -1, points: allPoints });
    }
    id++;
    socket.on('points', function (data) {
        if (data.id !== -1) {
            allPoints = allPoints.concat(data.points);
        }
        console.log('ids', data.id);
        console.log("got points", data.points);
        socket.broadcast.emit('newpoints', data);
    });
});
