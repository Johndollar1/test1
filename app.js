var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    path = require('path');

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', function (req, res) {
  res.sendfile('./public/index.html');
});

server.listen(process.env.PORT || 5000)s;

io.sockets.on('connection', function (socket) {

  socket.on('move', function (data) {
    socket.broadcast.emit('move', data);
  });

});

console.log('Gyro Server running');
