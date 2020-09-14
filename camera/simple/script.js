// @ts-nocheck
const cameraEl = document.getElementById('camera');

document.getElementById('btnCaptureCanvas').addEventListener('click', captureToCanvas);
document.getElementById('btnCaptureImg').addEventListener('click', captureToImg);

// Demo: list available devices
enumerateDevices();

// Start default camera
startCamera();

// Demonstrates capturing a frame as an IMG element
function captureToImg() {
  const imagesEl = document.getElementById('captureImages');
  const offscreenCanvasEl = document.getElementById('offscreenCanvas');

  // 1. First we have to capture to a hidden canvas
  offscreenCanvasEl.width = cameraEl.videoWidth;
  offscreenCanvasEl.height = cameraEl.videoHeight;
  var c = offscreenCanvasEl.getContext('2d');
  c.drawImage(cameraEl, 0, 0, cameraEl.videoWidth, cameraEl.videoHeight);

  // 2. Then we grab the data from the hidden canvas, and set it as the
  // source of a new IMG element
  var img = document.createElement('img');
  img.src = offscreenCanvasEl.toDataURL('image/jpeg');
  imagesEl.appendChild(img); // Add it to a DIV
}

// Demonstrates drawing a frame to a canvas
function captureToCanvas() {
  const canvasEl = document.getElementById('captureCanvas');
  canvasEl.width = cameraEl.videoWidth;
  canvasEl.height = cameraEl.videoHeight;
  var c = canvasEl.getContext('2d');
  c.drawImage(cameraEl, 0, 0, cameraEl.videoWidth, cameraEl.videoHeight);
}

// ------------------------

function enumerateDevices() {
  // Based on: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log('enumerateDevices() not supported.');
    return;
  }

  // List cameras and microphones.
  navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      devices.forEach(function (device) {
        if (device.kind !== 'videoinput') return;
        console.log(device.label + ' id = ' + device.deviceId);
      });
    })
    .catch(function (err) {
      console.log(err.name + ': ' + err.message);
    });
}

// Reports outcome of trying to get the camera ready
function cameraReady(err) {
  if (err) {
    console.log('Camera not ready: ' + err);
    return;
  }
}

// Tries to get the camera ready, and begins streaming video to the cameraEl element.
function startCamera() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  if (!navigator.getUserMedia) {
    cameraReady('getUserMedia not supported');
    return;
  }

  // Note the request parameters given to `getUserMedia`.
  //  Modifying this can allow you to select a different camera or the source resolution.
  //  For more details: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  // Examples:
  //  { video: { width: 1280, height: 720}, audio: false }
  //  { video: { facingMode: 'environment' }, audio: false}
  //  { video: { deviceId: '23e18d4292203610ee41e983b24c54fb7e30f98c62340d8004c66ecf885cab54' }, audio: false}
  // { video: true, audio: false }
  navigator.getUserMedia({ video: true, audio: false },
    (stream) => {
      try {
        cameraEl.srcObject = stream;
      } catch (error) {
        cameraEl.srcObject = window.URL.createObjectURL(stream);
      }
      cameraReady();
    },
    (error) => {
      cameraReady(error);
    });
}
