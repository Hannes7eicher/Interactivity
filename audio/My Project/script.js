var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var raf;
var running = true;
var r = 135;
var g = 50;
var b = 255;
var horizontal = 5;
var vertical = 5;

var ball = {
  x: 100,
  y: 100,
  vx: horizontal,
  vy: vertical,
  radius: 25,
  color: "rgb(" +r+ ", " +g+ ", " +b+ ")",
  draw: function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
};


function clear() {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function draw() {
  clear();
  ball.draw();
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y + ball.vy > canvas.height || ball.y + ball.vy < 0) {
    ball.vy = -ball.vy;
  }
  if (ball.x + ball.vx > canvas.width || ball.x + ball.vx < 0) {
    ball.vx = -ball.vx;
  }
}




let audioCtx, analyser;
let visualiser = null;
// Set up the interval meter.
// 5: number of samples to measure over
// 200: millisecond expected length of pulse (to avoid counting several times for same sound)
//      setting this too high will mean that legit pulses will be ignored
let intervalMeter = new IntervalMeter(5, 200);

if (document.readyState != 'loading') {
  onDocumentReady();
} else {
  document.addEventListener('DOMContentLoaded', onDocumentReady);
}

// Main initialisation, called when document is loaded and ready.
function onDocumentReady() {
  visualiser = new Visualiser(document.getElementById('visualiser'));
  visualiser.setExpanded(false); // Collapse at startup

  // Initalise microphone
  navigator.getUserMedia(
    { audio: true },
    onMicSuccess, // call this when ready
    error => { console.error('Could not init microphone', error); });

  setInterval(updateDisplay, 300);
}

// Microphone successfully initalised, we now have access to audio data
function onMicSuccess(stream) {
  audioCtx = new AudioContext();

  audioCtx.addEventListener('statechange', () => {
    console.log('Audio context state: ' + audioCtx.state);
  });

  analyser = audioCtx.createAnalyser();

  // fftSize must be a power of 2. Higher values slower, more detailed
  // Range is 32-32768
  analyser.fftSize = 256;

  // smoothingTimeConstant ranges from 0.0 to 1.0
  // 0 = no averaging. Fast response, jittery
  // 1 = maximum averaging. Slow response, smooth
  analyser.smoothingTimeConstant = 0.5;

  // Low and high shelf filters. Gain is set to 0 so they have no effect
  // could be useful for excluding background noise.
  const lowcut = audioCtx.createBiquadFilter();
  lowcut.type = "lowshelf";
  lowcut.frequency.value = 3000;
  lowcut.gain.value = 0;

  const highcut = audioCtx.createBiquadFilter();
  highcut.type = "highshelf";
  highcut.frequency.value = 10000;
  highcut.gain.value = 0;

  // Microphone -> filters -> analyser
  const micSource = audioCtx.createMediaStreamSource(stream);
  micSource.connect(lowcut);
  lowcut.connect(highcut);
  highcut.connect(analyser);

  // Start loop
  window.requestAnimationFrame(analyse);
}


function analyse() {
  const bins = analyser.frequencyBinCount;

  draw();

  // Get frequency and amplitude data
  const freq = new Float32Array(bins);
  const wave = new Float32Array(bins);
  analyser.getFloatFrequencyData(freq);
  analyser.getFloatTimeDomainData(wave);

  // In testing, with FFT size of 32, bucket #19 correspnds with metronome
  // ...but probably not your sound.
  const magicBucket = 8;
  const speed = 35;

  // Determine pulse if frequency threshold is exceeded.
  // -60 was determined empirically, you'll need to find your own threshold
  let hit = (freq[magicBucket] > -60);

  // An alternative approach is to check for a peak, regardless of freq
  // let hit = thresholdPeak(wave, 0.004);


  if (hit) {
    // Use the IntevalMeter (provided by util.js)
    // to track the time between pulses.

    // Returns TRUE if pulse was recorded, or FALSE if seems to be part of an already noted pulse
    let pulsed = intervalMeter.pulse();

    if (pulsed) {
      // Debug
      // let avgMs = intervalMeter.calculate();
      // let avgBpm = 1.0 / (avgMs / 1000.0) * 60.0;
      // console.log('level: ' + freq[magicBucket] +
      //   '\tms: ' + avgMs +
      //   '\tbpm: ' + avgBpm);
      document.getElementById('hit').classList.add('hit');
    }
  } else {
    document.getElementById('hit').classList.remove('hit');
  }

  // Optional rendering of data
  visualiser.renderWave(wave, true);
  visualiser.renderFreq(freq);


  // Run again
  window.requestAnimationFrame(analyse);
}



// Sets background colour and prints out interval info
function updateDisplay() {

  const magicBucket = 8;
  const freqOne = 35;
  const bins = analyser.frequencyBinCount;
  const freq = new Float32Array(bins);
  const wave = new Float32Array(bins);
  analyser.getFloatFrequencyData(freq);
  analyser.getFloatTimeDomainData(wave);

  // Calculate interval and derive BPM (if interval is above 0)
  const currentIntervalMs = intervalMeter.calculate();
  const currentBpm = currentIntervalMs ? parseInt(1.0 / (currentIntervalMs / 1000.0) * 60.0) : 0;

  // Use 300ms as an arbitrary limit (ie. fastest)
  let relative = 300 / currentIntervalMs;

  // Clamp value beteen 0.0->1.0
  if (relative > 1.0) relative = 1; if (relative < 0) relative = 0;

  // Make some hue and lightness values from this percentage
  const h = relative * 360;
  const l = relative * 80;

  // Update text readout
  document.getElementById('intervalMs').innerText = parseInt(currentIntervalMs) + ' ms.';
  document.getElementById('intervalBpm').innerText = currentBpm + ' bpm.';

  var x = 1- freq[magicBucket] / -80;
  var y = 1- freq[freqOne]  -80;


  if ( x < 0  ) x=0
  if (x > 1) x=1
  //console.log(x);

  //ball.radius = (100 * x) +1;
 /* r = ( 300 * x );
  g = ( 300 * x );
  b = ( 300 * x );
  ball.color = "rgb(" +r+ ", " +g+ ", " +b+ ")"'*/
  
  
 /* ball.vy = (x*50) + 1;
  ball.vx = (x*50) + 1;

  if (ball.vy < 5) ball.vy = 5;
  if (ball.vx < 5) ball.vx = 5;*/

 
console.log(ball.vx);

}