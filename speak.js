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
 * Returns the input text that was inserted in the $inputText element.
 * It makes a treatment to remove whitespaces that are on the start and end
 * of the text.
 *
 * @returns {string} The input text that was inserted in the $inputText element
 * with some treatments.
 */
function getInputText() {
  return $inputText.value.trim();
}

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

/**
 * Calculates the font size in rem units to be used in the $dialogueText element
 * based on the quantity of characters that were inserted in the $inputText
 * element.
 * 
 * @returns {number} The font size in rem units to be used in the $dialogueText
 * element.
 */
function calculateDialogueTextFontSize() {
  const inputText = getInputText();
  const numberOfCharacters = inputText.length;
  const numberOfCharactersToStartChangingStyle = 90;

  return numberOfCharacters > numberOfCharactersToStartChangingStyle
  ? 3 * 0.993 ** numberOfCharacters + 0.9
  : 2.5
}

/**
 * Plays audio 
 */
function play(buffer, rate) {
  const audioContext = new AudioContext();
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  source.connect(audioContext.destination);
  source.start();
}

function loadSounds() {
  addSound(voicePath + "quack.mp3", "quack");
  addSound(voicePath + "santa.wav", "santa");
  addSound(voicePath + "bark.wav", "bark");
  addSound(voicePath + "meow.wav", "meow");
  addSound(voicePath + "moo.mp3", "moo");
  addSound(voicePath + "woof.mp3", "woof");
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

function clear() {
  if (speakingInterval !== "CLEARED") {
    clearInterval(speakingInterval);
  }

  $dialogueText.innerHTML = "";
  speaking = false;
  speakingInterval = "CLEARED";
}

function speak(text, time, rate) {
  if (!speaking) {
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

function playClip() {
  clear();

  if ($inputText.value) {
    /**
     * TODO: the fact that the dialogue text font size is using `vw` unit is
     * making it look small in small width screen, such as mobile devices, as
     * reported in the issue #6.
     */
    const dialogueTextFontSize = calculateDialogueTextFontSize() + 'vw';
    $dialogueText.style.fontSize = dialogueTextFontSize;

    const pitchRate = calculatePitchRate();
    const interval = calculateInterval();

    speakingInterval = speak(
      $inputText.value,
      interval,
      pitchRate
    );
  }
}

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

