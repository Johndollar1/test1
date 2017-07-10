var express = require('express');
var path = require('path');
var app = express();
var jgh = require('./jmolGyroHandler');

app.configure(function() {
    app.use(express.static(path.join(__dirname,'public')));
});

var server = require('http').createServer(app).listen(8080);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    jgh.initHandler(io, socket);
});


