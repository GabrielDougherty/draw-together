'use strict';

const canvas = document.getElementById('drawingCanvas'),
    canvLeft = canvas.offsetLeft,
    canvTop = canvas.offsetTop;
function preventDefault(e){
    e.preventDefault();
}
    
function disableScroll(){
    document.body.addEventListener('touchmove', preventDefault, { passive: false });
}
function enableScroll(){
    document.body.removeEventListener('touchmove', preventDefault);
}
var socket = io();
var id = -1;
var mouseProperties = { state: 'up' }
var ctx;
var points = [];
socket.on('id', (data) => id = data.id);

const LINE_WIDTH = 5;

// send points to server
const sendPoints = function (points) {
    console.log(`Sending ${points.length} state`);
    console.log(points);
    socket.emit('state', { id: id, state: [{ type: 'line', data: points }] });
    points.length = 0;
};
const drawPoint = function (point) {
    ctx.fillRect(point.x, point.y, 5, 5);
};
const drawLine = function (point1, point2) {
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.lineWidth = LINE_WIDTH;
    ctx.stroke();
};
const getCurrentPoint = function (event) {
    let x = event.pageX - canvLeft,
        y = event.pageY - canvTop;
    return { x, y };
};

// useful when receiving objects from server
const drawCanvasObject = function (obj) {
    points = [];
    if (obj.type == 'line') {
        for (let p of obj.data) {
            interactiveDrawPoint(p);
        }
    }
    points = [];
};

// TODO: store lines as separate segments so they aren't all connected
const interactiveDrawPoint = function (point) {
    if (points.length == 0) {
        drawPoint(point);
    } else {
        drawLine(points[points.length - 1], point);
    }
    points.push(point);
}
const handleMouseMove = function (event) {
    if (mouseProperties.state === 'down') {
        interactiveDrawPoint(getCurrentPoint(event));
    }
};
const handleMouseDown = function (event) {
    interactiveDrawPoint(getCurrentPoint(event));
    mouseProperties.state = 'down';
};
const handleMouseUp = function (event) {
    interactiveDrawPoint(getCurrentPoint(event));
    mouseProperties.state = 'up';
    sendPoints(points);
};
const clearCanvas = function () {
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
};
const clearCanvasButtonCB = function () {
    clearCanvas();
    socket.emit('clear', { id: id });
};
if (canvas.getContext) {
    ctx = canvas.getContext('2d');

    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchend', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchmove', handleMouseMove);
    socket.on('newpoints', (data) => {
        console.log('got new points', data.id, data.state);
        if (data.id !== id) {
            for (let s of data.state) {
                drawCanvasObject(s);
            }
        }
    });
    socket.on('clear', (data) => {
        if (data.id !== id) {
            clearCanvas();
        }
    });
} else {
    document.write("This game requires HTML5 canvas support, but your browser doesn't support it");
}
