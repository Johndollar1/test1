var io;
var gyroSocket;

exports.initHandler = function(cio, socket){
    io = cio;
    gyroSocket = socket;
    console.log('inside gyro');
    gyroSocket.emit('connected', "You are connected!");   
    
    // Canvas Events
    gyroSocket.on('hostCreateNewCanvas', hostCreateNewCanvas); 

	// Gyro Events
    gyroSocket.on('playerJoinCanvas', playerJoinCanvas);
    gyroSocket.on('valuesChange',writeToConsole);
}

/* *******************************
   *                             *
   *      CANVAS FUNCTIONS       *
   *                             *
   ******************************* */
   
function hostCreateNewCanvas() {
    var thisCanvasId = ( Math.random() * 100000 ) | 0;
    
    this.emit('newCanvasCreated', {canvasId: thisCanvasId, mySocketId: this.id});
    // Join the Room and wait for the gyro to link

    this.join(thisCanvasId.toString());
};

function writeToConsole(data) {
    io.sockets.in(data.canvasId).emit('updateCanvasGyro', data);
};
  
/* *****************************
   *                           *
   *      GYRO FUNCTIONS       *
   *                           *
   ***************************** */


function playerJoinCanvas(data) {
    console.log('User ' + data.playerName + 'attempting to join canvas: ' + data.canvasId );

    // A reference to the Users Socket.IO socket object
    var sock = this;

    // Look up the room ID in the Socket.IO manager object.
    var room = gyroSocket.manager.rooms["/" + data.canvasId];

    if( room != undefined ){
        // attach the socket id to the data object.
        data.mySocketId = sock.id;

        // Join the room
        sock.join(data.canvasId);

        // Emit an event notifying that user has joined the room.
        io.sockets.in(data.canvasId).emit('playerJoinedCanvas', data);

    } else {
        // Otherwise, send an error message back to the User.
        this.emit('error',{message: "This canvas does not exist."} );
    }
};
