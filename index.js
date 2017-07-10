var express = require('express');
var path = require('path');
var app = express();
var jgh = require('./jmolGyroHandler');

app.configure(function() {
    app.use(express.static(path.join(__dirname,'public')));
});

var port = Number(process.env.PORT || 5000);

var server = require('http').createServer(app).listen(port);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    jgh.initHandler(io, socket);
});


