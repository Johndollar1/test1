window.onload = init();

function init() {

// connect socket
var dir;
var socket = io.connect();

// play is broadcast, play the song
socket.on('play', function(data) {
		var audioElem = document.getElementById('audio');
		if (audioElem.paused) {
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
