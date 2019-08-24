"use strict";

const canvas = document.getElementById("drawingCanvas"),
    canvLeft = canvas.offsetLeft,
    canvTop = canvas.offsetTop;
var socket = io('http://localhost');
var id = -1;
socket.on('id', (data) => id = data.id);
//const pointSizeLimit = 500;
// limit point size sent to server
/*
const getResizedPoints = function(points) {
    while (points.length > pointSizeLimit) {
        points.shift();
    }
    return points;
};
*/
// send points to server
const sendPoints = function(points) {
    console.log(`Sending ${points.length} points`);
    console.log(points);
    socket.emit('points', {id: id, points: points});
    points.length = 0;
    return points;
};

if (canvas.getContext) {
    const ctx = canvas.getContext('2d');

    let points = [];
    setInterval(() => {
        if (points.length > 0) {
            sendPoints(points);
        }
    }, 500);
    canvas.addEventListener('click', (event) => {
        let x = event.pageX - canvLeft,
            y = event.pageY - canvTop;
        points.push({x,y});
        //points = getResizedPoints(points);
        ctx.fillRect(x,y,5,5);
    });
    socket.on('new points', (data) => {
        console.log('got new points', data.id, data.points);
        if (data.id !== id) {
            for (let p of data.points) {
                ctx.fillRect(p.x,p.y,5,5);
            }
        }
    });
} else {
    document.write("This game requires HTML5 canvas support, but your browser doesn't support it");
}