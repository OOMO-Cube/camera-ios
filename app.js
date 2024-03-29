var faceapi = require('face-api.js');

let inputSize = 256
let scoreThreshold = 0.5


// Set constraints for the video stream
var constraints = { video: { facingMode: "user" }, audio: false };
var track = null;

// Define constants
const cameraView = document.querySelector("#camera--view");
const cameraOutput = document.querySelector("#camera--output");
const cameraSensor = document.querySelector("#camera--sensor");
const cameraTrigger = document.querySelector("#camera--trigger");
const cameraOverlay = document.querySelector("#camera--overlay");
const indicator = document.querySelector("#indicator");

const indicatorCtx = indicator.getContext('2d');
const overlayCtx = cameraOverlay.getContext('2d');

const runOptions = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
const drawOptions = new faceapi.draw.DrawFaceLandmarksOptions({drawPoints: false, lineColor: "green"})

var num_failed_frames = 0

async function onPlay() {
  const result = await faceapi.detectSingleFace(cameraView, runOptions).withFaceLandmarks(true)
  if (result) {
    num_failed_frames = 0
    const dims = faceapi.matchDimensions(cameraOverlay, cameraView, true)
    const resizedResult = faceapi.resizeResults(result, dims)
    const x_pos = resizedResult.landmarks.positions.map(point => point.x)
    // console.log(result.landmarks);
    // console.log(resizedResult.landmarks);
    console.log([Math.max.apply(null, x_pos), Math.min.apply(null, x_pos), Math.max.apply(null, x_pos)- Math.min.apply(null, x_pos), cameraOverlay.width]);



    if (Math.max.apply(null, x_pos)- Math.min.apply(null, x_pos) > cameraOverlay.width * 3 / 7) {
      console.log("green")


      //Draw Canvas Fill mode
      indicatorCtx.fillStyle = 'green';
      indicatorCtx.fillRect(0,0,indicator.width, indicator.height);
    } else {
      console.log("red")
      //Draw Canvas Fill mode
      indicatorCtx.fillStyle = 'red';
      indicatorCtx.fillRect(0,0,indicator.width, indicator.height);
    }

    // faceapi.draw.drawDetections(cameraOverlay, resizedResult)
    faceapi.draw.drawFaceLandmarks(cameraOverlay, resizedResult, drawOptions);
  } else if (num_failed_frames > 5){
    console.log("red")
    //Draw Canvas Fill mode
    indicatorCtx.fillStyle = 'red';
    indicatorCtx.fillRect(0,0,indicator.width, indicator.height);

    overlayCtx.clearRect(0, 0, cameraOverlay.width, cameraOverlay.height);
  } else {
    num_failed_frames++
  }

  setTimeout(() => onPlay())
}

cameraView.onplay = onPlay

// Access the device camera and stream to cameraView
async function cameraStart() {

  await faceapi.nets.faceLandmark68TinyNet.loadFromUri("models");
  await faceapi.nets.tinyFaceDetector.loadFromUri('models')

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function(stream) {
      track = stream.getTracks()[0];
      cameraView.srcObject = stream;
    })
    .catch(function(error) {
      console.error("Oops. Something is broken.", error);
    });
}


// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function() {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  cameraOutput.src = cameraSensor.toDataURL("image/webp");
  cameraOutput.classList.add("taken");
  // track.stop();
};

// Start the video stream when the window loads
window.addEventListener("load", cameraStart, false);
console.log(faceapi.nets);
console.log("hello");
