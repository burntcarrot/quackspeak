const voicePath = "assets/voice/";
var audioContext;
var sounds = [];
var inputText;
var dialogueText;
var pitchSlider;
var intervalSlider;
var speaking = false;
var speakingInterval = "CLEARED";
var pitchRate = 1;
var interval = 175;

document.addEventListener("DOMContentLoaded", function (e) {
  inputText = document.getElementById("inputText");
  dialogueText = document.getElementById("dialogue-text");
  pitchSlider = document.getElementById("pitchSlider");
  intervalSlider = document.getElementById("intervalSlider");

  pitchSlider.oninput = function () {
    pitchRate = 0.4 * Math.pow(4, Number(this.value)) + 0.2; // Had to look this up on the internet!
  };

  intervalSlider.oninput = function () {
    interval = Number(this.value);
  };

  document.addEventListener("pointerdown", init);
});

function init() {
  // Create AudioContext
  audioContext = new AudioContext();

  // Load sound files.
  loadSounds();

  // Remove event listener.
  document.removeEventListener("pointerdown", init);
}

function loadSounds() {
  addSound(voicePath + "quack.mp3", "quack");
  addSound(voicePath + "santa.wav", "santa");
  addSound(voicePath + "bark.wav", "bark");
  addSound(voicePath + "meow.wav", "meow");
  addSound(voicePath + "moo.mp3", "moo");
  addSound(voicePath + "woof.mp3", "woof");
}

// Play from buffer.
function play(buffer, rate) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  source.connect(audioContext.destination);
  source.start();
}

// Load sound buffer from path
async function load(path) {
  const response = await fetch("./" + path);
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

// Add sound file to sounds array
function addSound(path, index) {
  load(path).then((response) => {
    sounds[index] = response;
  });

  return index;
}

function playClip() {
  // clear speaking intervals and dialogue box
  clear();

  if (inputText.value !== "") {
    if (inputText.value.length > 90) {
      dialogueText.style.fontSize =
        (3 * Math.pow(0.993, inputText.value.length) + 0.9)
          .toFixed(1)
          .toString() + "vw"; // I don't remember how I computed this, but it works
    } else {
      dialogueText.style.fontSize = "2.5vw";
    }

    // get interval ID
    speakingInterval = speak(
      inputText.value.replace(/(\r|\n)/gm, " "), // Replace newlines with whitespace.
      interval,
      pitchRate
    );
  }
}

// Clear speaking intervals and dialogue box
function clear() {
  if (speakingInterval !== "CLEARED") {
    clearInterval(speakingInterval);
  }

  // reset everything.
  dialogueText.innerHTML = "";
  speaking = false;
  speakingInterval = "CLEARED";
}

function speak(text, time, rate, ignore = false) {
  if (!speaking || ignore) {
    speaking = true;

    // text processing
    var arrayTxt = text.split("");
    arrayTxt.push(" ");
    var length = text.length;

    var intervalID = setLimitedInterval(
      function (i) {
        if (text[i] != " ") {
          // for quack, pitch rate = 1 is fine!
          play(sounds["quack"], pitchRate);
        }

        dialogueText.innerHTML += arrayTxt[i];
      },
      time,
      length,
      null,
      function () {
        // set to false when it ends
        speaking = false;
      }
    );

    return intervalID;
  }
}

function setLimitedInterval(
  func,
  time,
  iterations,
  beginning = null,
  ending = null
) {
  var i = 0;

  if (beginning !== null) {
    beginning();
  }

  var id = setInterval(function () {
    func(i);
    i++;

    if (i === iterations) {
      if (ending !== null) {
        ending();
      }
      clearInterval(id);
    }
  }, time);

  return id;
}
