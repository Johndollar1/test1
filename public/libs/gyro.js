var abc=0;
    function calculateValues(ad) {
      if (window.DeviceOrientationEvent) {
        document.getElementById("doEvent").innerHTML = "DeviceOrientation";
        // Listen for the deviceorientation event and handle the raw data
        window.addEventListener('deviceorientation', function(eventData) {
          // gamma is the left-to-right tilt in degrees, where right is positive
          var tiltLR = eventData.gamma;
	 
	 // beta is the front-to-back tilt in degrees, where front is positive
          var tiltFB = eventData.beta;
          
          // alpha is the compass direction the device is facing in degrees
	  var dir = eventData.alpha
          
	  var data = {LR:Math.round(tiltLR),FB:Math.round(tiltFB),D:Math.round(dir)};
	  
          ad.emit('valuesChange',data);
          // call our orientation event handler
          deviceOrientationHandler(tiltLR, tiltFB, dir);
          }, false);
      } else {
        document.getElementById("doEvent").innerHTML = "Not supported on your device or browser.  Sorry."
      }
    }
  
    function deviceOrientationHandler(tiltLR, tiltFB, dir) {
      document.getElementById("doTiltLR").innerHTML = Math.round(tiltLR);
      document.getElementById("doTiltFB").innerHTML = Math.round(tiltFB);
      document.getElementById("doDirection").innerHTML = Math.round(dir);
    }    

    // Some other fun rotations to try...
    //var rotation = "rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";
    //var rotation = "rotate("+ tiltLR +"deg) rotate3d(0,1,0, "+ (tiltLR*-1)+"deg) rotate3d(1,0,0, "+ (tiltFB*-1)+"deg)";	 


   function getabc(){
	return this.abc;
}