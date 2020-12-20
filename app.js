"use strict";
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3004);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/canvas.js', (req, res) => {
    res.sendFile(__dirname + '/canvas.js');
});
var points = [];
var id = 0;
io.on('connection', function (socket) {
    socket.emit('id', {id: id});
    id++;
    socket.on('points', function (data) {
        if (data.id !== -1) {
            points.concat(data.points);
        }
        console.log('ids', data.id);
        console.log("got points", data.points);
        socket.broadcast.emit('new points', data);
    });
});