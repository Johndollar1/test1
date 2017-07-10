## Synopsis
My project involved using the phones accelerometer to control html5 elements on my laptop screen. To do this, I would have to use Node.js to setup a server and Socket.io to transmit events from my phone to the server. I would also need to use Adobe Illustrator to make SVG’s of Phife Dawg, export these SVG files and use them as HTML5 elements which could be manipulated on the laptop screen.

A Physical Web bluetooth beacon would broadcast the mobile website which would have them be opened and accessed on a cellular device.
To begin I had to setup a basic Node.js server. This involved setting up a server.js file and including these lines:

## Server.js
```
var http = require('http');      
var server = http.createServer();     
server.listen(8001);
```

## Hello World on Server.js
The server still did nothing so the next step was getting it to output “hello world”.
I changed the var server variable to this:
```
var server = http.createServer(function(request, response){        
response.writeHead(200, {'Content-Type': 'text/html'});         
response.write('hello world');         
response.end();     
}); 
```

With these changes we were now sending something to the client. I saved server.js and ran node server.js in the terminal. Upon going to http://localhost:8001 the page said “hello world”!

## Routing
Now that my server was setup, I needed to setup the routing required. To setup basic routing to the socket.io, I needed to add the following code:
```
var io = require('socket.io');  
var server = http.createServer(function(request, response){     
var path = url.parse(request.url).pathname;      
switch(path){        
	case '/':response.writeHead(200, {'Content-Type': 'text/html'});            
	response.write('hello world');             
	response.end();             
	break; 
	
	case '/socket.html':             
	fs.readFile(__dirname + path, 
	function(error, data){                 
	if (error){                     
	response.writeHead(404);                     
	response.write("opps this doesn't exist - 404");                     
	response.end();                 
	}                
	else{                     
	response.writeHead(200, {"Content-Type": "text/html"});                     
	response.write(data, "utf8");                     
	response.end();                 
	}});             
	break;       
	
	default:             
	response.writeHead(404);             
	response.write("opps this doesn't exist - 404");             
	response.end();             
	break;    
	}});  
	
	server.listen(8001); 
	 io.listen(server);
```
All we added here was a require for the socket.io module at the top and the line io.listen(server);. When the server was instantiated, we opened a listener for socket.io. This means that our server listened for pages loaded by the server that had a WebSocket connection instantiated on them. 


## Mobile.html
I then created a mobile.html file which would be responsible for sending device orientation information to the server. The main source code for this file was:
```
  // connect socket
    var socket = io.connect();

document.addEventListener("touchstart", function() {
socket.emit('playMusic', {'play': true});
}, false);

document.addEventListener("touchend", function() {
socket.emit('playMusic', {'play': false});
}, false);


if (window.DeviceOrientationEvent) {
	window.addEventListener('deviceorientation', function(eventData){
	var tiltLR = eventData.gamma;
	var tiltFB = eventData.beta;
	var dir = 0;
	socket.emit('deviceMove', {'lr': tiltLR, 'fb': tiltFB, 'dir': dir});
	DeviceOrientationHandler(tiltLR, tiltFB, dir);}, false);
} 
else {
	alert("not supported");
}
```

## Audio.js
In my file that was hosted on the desktop- “socket.html”, I loaded an audio.js file. This file basically listened for an event broadcasted from the server.js file. Once broadcasted the following functions were run:
```
// play is broadcast, play the song
socket.on('play', function(data) {
var audioElem = document.getElementById('audio');
	if (audioElem.paused){
	audioElem.play();
	console.log("playing");
	}
	else{
	audioElem.pause();
	console.log("paused");
	}
	});

// When device motion is triggered
socket.on('deviceData', function(data){
	// store orientation data
	var lr = Math.ceil(data.lr);
	var fb = Math.ceil(data.fb) + 90; // to offset the -90deg
	dir = Math.ceil(data.dir);

	// get reference to shapes
	var facefront = document.querySelector("#facefront");
	var faceback = document.querySelector("#faceback");

	// move shapes left or right on tilt
	facefront.style.left = ((lr * 100)/360) * 0.1 + 62.5 + "%";
	faceback.style.left = ((lr * 100)/360) * 0.2  + 50 + "%";

	// move shapes up or down on tilt
	facefront.style.top = (((fb - 90) * -100)/180) * 0.09 + 90 + "%";
	faceback.style.top = (((fb - 90) * -100)/180) * 0.1 + 50 +"%";
	})
}
```
The above functions let me play music on a touch event, or move the Phife SVG’s on screen if the mobile device was tilted in a certain way.











