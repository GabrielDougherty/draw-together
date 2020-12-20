'use strict';

const canvas = document.getElementById('drawingCanvas'),
    canvLeft = canvas.offsetLeft,
    canvTop = canvas.offsetTop;
var socket = io();
var id = -1;
var mouseProperties = {state: 'up'}
var ctx;
var points = [];
socket.on('id', (data) => id = data.id);

// send points to server
const sendPoints = function(points) {
    console.log(`Sending ${points.length} points`);
    console.log(points);
    socket.emit('points', {id: id, points: points});
    points.length = 0;
};
const drawPoint = function(point) {
    ctx.fillRect(point.x,point.y,5,5);
};
const getCurrentPoint = function(event) {
    let x = event.pageX - canvLeft,
        y = event.pageY - canvTop;
    return {x,y};
};
const drawCurrentPoint = function(event) {
    let point = getCurrentPoint(event);
    drawPoint(point);
    points.push(point);
};
const handleMouseMove = function(event) {
    if (mouseProperties.state === 'down') {
        drawCurrentPoint(event);
    }
};
const handleMouseDown = function(event) {
    drawCurrentPoint(event);
    mouseProperties.state = 'down';
};
const handleMouseUp = function(event) {
    drawCurrentPoint(event);
    mouseProperties.state = 'up';
    sendPoints(points);
};
if (canvas.getContext) {
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchend', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchmove', handleMouseMove);
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