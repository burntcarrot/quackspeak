const voicePath = "assets/voices/";
var audioContext;
var sounds = [];
var speaking = false;
var speakingInterval = "CLEARED";

/** @type {HTMLTextAreaElement} */
const $inputText = document.querySelector('.js-input-text');
/** @type {HTMLDivElement} */
const $dialogueText = document.querySelector('.js-dialogue-text');
/** @type {HTMLInputElement} */
const $pitchSlider = document.querySelector('.js-pitch-slider');
/** @type {HTMLInputElement} */
const $intervalSlider = document.querySelector('.js-interval-slider');

/**
 * Returns the pitch rate value based on the value of the $pitchSlider
 * element in the page.
 *
 * If the $pitchSlider has not been changed, it returns 1 by default.
 *
 * @returns {number} The pitch rate.
 */
function calculatePitchRate() {
  return 0.4 * Math.pow(4, Number(this.value)) + 0.2 | 1;
}

/**
 * Returns the interval based in the value of the $intervalSlider element
 * in the page.
 *
 * If the $intervalSlider has not been changed, it returns 175 by default.
 *
 * @returns {number} The interval.
 */
function calculateInterval() {
  return $intervalSlider.value | 175;
}

/**
 * Returns the decoded audio data from a voice file in the server.
 *
 * @param {string} The file name that is under the path `assets/voices/`,
 * for example: `quack.mp3`.
 */
async function createDecodedAudioDataFromVoiceFile(fileName) {
  const voiceFileDirectoryPath = 'assets/voices/' + fileName;
  const fileResponse = await fetch(voiceFileDirectoryPath);
  const arrayBuffer = await fileResponse.arrayBuffer();
  const audioContext = new AudioContext();

  return audioContext.decodeAudioData(arrayBuffer);
}

function loadSounds() {
  addSound(voicePath + "quack.mp3", "quack");
  addSound(voicePath + "santa.wav", "santa");
  addSound(voicePath + "bark.wav", "bark");
  addSound(voicePath + "meow.wav", "meow");
  addSound(voicePath + "moo.mp3", "moo");
  addSound(voicePath + "woof.mp3", "woof");
}

function play(buffer, rate) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  source.connect(audioContext.destination);
  source.start();
}

async function load(path) {
  const response = await fetch("./" + path);
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

function addSound(path, index) {
  load(path).then((response) => {
    sounds[index] = response;
  });

  return index;
}

function playClip() {
  clear();

  if ($inputText.value !== "") {
    if ($inputText.value.length > 90) {
      $dialogueText.style.fontSize =
        (3 * Math.pow(0.993, $inputText.value.length) + 0.9)
          .toFixed(1)
          .toString() + "vw";
    } else {
      $dialogueText.style.fontSize = "2.5vw";
    }

    const pitchRate = calculatePitchRate();
    const interval = calculateInterval();

    speakingInterval = speak(
      $inputText.value.replace(/(\r|\n)/gm, " "),
      interval,
      pitchRate
    );
  }
}

function clear() {
  if (speakingInterval !== "CLEARED") {
    clearInterval(speakingInterval);
  }

  $dialogueText.innerHTML = "";
  speaking = false;
  speakingInterval = "CLEARED";
}

function speak(text, time, rate, ignore = false) {
  if (!speaking || ignore) {
    speaking = true;

    var arrayTxt = text.split("");
    arrayTxt.push(" ");
    var length = text.length;

    const pitchRate = calculatePitchRate();

    var intervalID = setLimitedInterval(
      function (i) {
        if (text[i] != " ") {
          play(sounds["quack"], pitchRate);
        }

        $dialogueText.innerHTML += arrayTxt[i];
      },
      time,
      length,
      null,
      function () {
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

audioContext = new AudioContext();
loadSounds();

(async () => {
  const voices = {
    quack: await createDecodedAudioDataFromVoiceFile('quack.mp3'),
    santa: await createDecodedAudioDataFromVoiceFile('santa.wav'),
    bark: await createDecodedAudioDataFromVoiceFile('bark.wav'),
    meow: await createDecodedAudioDataFromVoiceFile('meow.wav'),
    moo: await createDecodedAudioDataFromVoiceFile('moo.mp3'),
    woof: await createDecodedAudioDataFromVoiceFile('woof.mp3'),
  };
})();

