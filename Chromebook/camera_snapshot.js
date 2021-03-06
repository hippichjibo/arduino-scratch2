/* Extension using Javascript Media Streams to get images from the camera */
/* Randi Williams <randiw12@mit.edu> January 2020 */
(function() {
  var ext = this;
  var ctx, canvas, videoElem;
  var extStatus = 1;
  var extStatusMsg = '';
  /*
   * variables
   */
  async function startImageWebcam() {
    console.log("Starting webcam");
    if (navigator.getUserMedia) {
      extStatus = 2;
      navigator.getUserMedia(
        // options
        {
          video: true
        },
        // success callback
        function(localMediaStream) {
          // Setup the video element that will contain the webcam stream      
          videoElem = document.createElement('video');
          try {
            videoElem.srcObject = localMediaStream;
          } catch (e) {
            videoElem.src = window.URL.createURLObject(localMediaStream);
          }
          videoElem.play();
          window.webcamStream = localMediaStream; // what is this?
        },
        // error callback
        function(err) {
          extStatus = 0;
          extStatusMsg = 'Please load the website from a secure URL: https://scratchx.org';
          console.log("Error starting webcam: " + err);
        });
    } else {
      extStatus = 0;
      extStatusMsg = 'Please allow access to the webcam and refresh the page';
      console.log("getUserMedia not supported");
    }
  }
  ext.stopWebcam = function() {
    window.webcamStream.getVideoTracks().forEach(function(track) {
      track.stop();
    });
  };
  ext.getCameraURL = function(callback) {
    ext.updateWebcam();
    // Get an image dataURL from the canvas
    var imageDataURL = canvas.toDataURL('image/jpeg').substring(23); // 23 is how many chars you need to chop off the beginning
    console.log(imageDataURL);
    callback(imageDataURL);
  };
  ext.updateWebcam = function() {
    // Setup the canvas object that will hold an image snapshot            
    canvas = document.createElement('canvas');
    // Get the exact size of the video element.
    window.width = 320; // videoElem.videoWidth; going to try to scale the image down 
    window.height = 240; // videoElem.videoHeight; 
    // Set the canvas to the same dimensions as the video.
    canvas.width = width;
    canvas.height = height;
    // Setup the context object for working with the canvas
    ctx = canvas.getContext('2d');
    // Draw a copy of the current frame from the video on the canvas
    ctx.drawImage(videoElem, 0, 0, width, height);
  };
  /*ext.callbackFunc = function (args callback) {
    if (typeof callback=="function") callback();
  };*/
  //ext.dataFunc = function () {return data;};
  ext._shutdown = function() {
    ext.stopWebcam();
  };
  ext._getStatus = function() {
    if (extStatus !== 2) {
      return {
        status: extStatus,
        msg: extStatusMsg
      };
    }
    return {
      status: 2,
      msg: 'Ready'
    };
  };
  var descriptor = {
    blocks: [
      ['R', 'camera image', 'getCameraURL']
    ],
    menus: {}
  };
  startImageWebcam().then(() => {
    ScratchExtensions.register('PRG Camera', descriptor, ext);
  });
})();