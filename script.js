//@ts-check
/**
 * An object containing the decoded audio data of the voices that are
 * stored locally in the server.
 *
 * Each key of this object is the name of the voice file and also corresponds
 * to one of the options of the voice selector in the page.
 *
 * This variable starts `undefined`, and is only defined when the user
 * interacts with the page by using the function
 * `loadLocalVoicesDecodedAudioData`. This is needed to fix the error `The
 * AudioContext was not allowed to start`, loading the local voices only when
 * the user interacts with the page.
 */
let localVoices;
/**
 * An array that contains all the ids of the timeouts set by the `speak`
 * function. Each timeout is corresponded to the speak of one of the
 * characters inserted in the $inputText element.
 *
 * This array needs to exist to the code be able to cancel previous timeouts
 * avoiding the audio to overlap each other.
 *
 * @type {Array<number>}
 */
let speakTimeoutsIds = [];
/**
 * A number that will keep the sum of all the random intervals added to the
 * timeouts of the `speak` function. This is needed to make the timeout time
 * work whenever a random interval has been added when a white space is hit.
 */
let randomIntervalsInMilliseconds = 0;

/** @type {HTMLTextAreaElement} */
const $inputText = document.querySelector('.js-input-text');
/** @type {HTMLDivElement} */
const $dialogueText = document.querySelector('.js-dialogue-text');
/** @type {HTMLInputElement} */
const $pitchSlider = document.querySelector('.js-pitch-slider');
/** @type {HTMLInputElement} */
const $intervalSlider = document.querySelector('.js-interval-slider');
/** @type {HTMLSelectElement} */
const $voiceSelector = document.querySelector('.js-voice-selector');
/** @type {HTMLButtonElement} */
const $sayItButton = document.querySelector('.js-say-it-button');

$sayItButton.addEventListener('pointerdown', async () => {
  await speak();
  writeDialogueText();
});

/**
 * Returns the input text that was inserted in the $inputText element.
 * It makes a treatment to remove white spaces that are on the start and end
 * of the text.
 *
 * @returns {string} The input text that was inserted in the $inputText
 * element with some treatments.
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
  return 0.4 * 4 ** $pitchSlider.value + 0.2;
}

/**
 * Returns the speak interval in milliseconds based on the value of the
 * $intervalSlider element in the page.
 *
 * If the $intervalSlider has not been changed, it returns 175 by default,
 * that is the value set in the HTML page.
 *
 * @returns {number} The speak interval in milliseconds.
 */
function calculateIntervalInMilliseconds() {
  return $intervalSlider.value;
}

/**
 * Returns a promise that gives the decoded audio data from a voice file in
 * the server.
 *
 * @async
 *
 * @param {string} fileName The file name that is under the path
 * `assets/voices/`, for example: `quack.mp3`.
 *
 * @returns {Promise<AudioBuffer>} The decoded audio data.
 */
async function createDecodedAudioDataFromVoiceFile(fileName) {
  const voiceFileDirectoryPath = 'assets/voices/' + fileName;
  const fileResponse = await fetch(voiceFileDirectoryPath);
  const arrayBuffer = await fileResponse.arrayBuffer();
  const audioContext = new AudioContext();

  return audioContext.decodeAudioData(arrayBuffer);
}

/**
 * Plays the audio from the decoded audio data.
 *
 * @param {AudioBuffer} decodedAudioData An audio buffer that contains the
 * decoded audio data. It may be a result of the function
 * `createDecodedAudioDataFromVoiceFile`.
 */
function playDecodedAudioData(decodedAudioData) {
  const audioContext = new AudioContext();
  const source = audioContext.createBufferSource();
  const pitchRate = calculatePitchRate();

  source.buffer = decodedAudioData;
  source.playbackRate.value = pitchRate;
  source.connect(audioContext.destination);
  source.start();
}

/**
 * Cancels previous speak timeouts to avoid the audio to overlap each other
 * and make too much noise.
 */
function cancelPreviousSpeakTimeouts() {
  const hasSpeakTimeoutIds = speakTimeoutsIds.length > 0;
  if (hasSpeakTimeoutIds) {
    speakTimeoutsIds.forEach((speakTimeoutId) => {
      clearTimeout(speakTimeoutId);
    });
    speakTimeoutsIds = [];
  }
}

/**
 * Writes the input text inserted at the $inputText element to the
 * $dialogueText element.
 */
function writeDialogueText() {
  const inputText = getInputText();
  const inputTextCharacters = inputText.split('');
  const intervalInMilliseconds = calculateIntervalInMilliseconds();

  $dialogueText.innerHTML = '';

  inputTextCharacters.forEach((
      inputTextCharacter,
      inputTextCharacterIndex
  ) => {
    speakTimeoutsIds.push(setTimeout(() => {
      $dialogueText.innerHTML += inputTextCharacter;
    }, intervalInMilliseconds * inputTextCharacterIndex));
  });
}

/**
 * Loads the local voices. This is needed to fix the error
 * `The AudioContext was not allowed to start`, loading the local voices only
 * when the user interact with the page.
 *
 * @async
 */
async function loadLocalVoices() {
  if (!localVoices) {
    localVoices = {
      quack: await createDecodedAudioDataFromVoiceFile('quack.mp3'),
      bark: await createDecodedAudioDataFromVoiceFile('bark.wav'),
      meow: await createDecodedAudioDataFromVoiceFile('meow.wav'),
    };
  }
}

/**
 * Adds a random interval, in milliseconds, into the
 * `randomIntervalsInMilliseconds` array that may be used by the `speak`
 * function to create a more natural feeling, being applied whenever there is
 * a white space in the input text.
 */
function addRandomIntervalInMilliseconds() {
  /**
   * The minimum value for the interval, in milliseconds.
   * @type {number}
   **/
  const minimumIntervalInMilliseconds = 100;
  /**
   * The maximum value for the interval, in milliseconds.
   * @type {number}
   **/
  const maximumIntervalInMilliseconds = 500;
  const randomIntervalInMilliseconds =
      Math.floor(Math.random() * maximumIntervalInMilliseconds) +
      minimumIntervalInMilliseconds;

  randomIntervalsInMilliseconds += randomIntervalInMilliseconds;
}

/**
 * Cancels all the previous random intervals used, by reseting the
 * `randomIntervalsInMilliseconds` to zero, as it was at the start.
 */
function cancelRandomIntervals() {
  randomIntervalsInMilliseconds = 0;
}

/**
 * Creates and plays a speak with the input text inserted in the $inputText
 * element.
 *
 * @async
 */
async function speak() {
  await loadLocalVoices();
  cancelPreviousSpeakTimeouts();
  cancelRandomIntervals();

  const inputText = getInputText();
  const inputTextCharacters = inputText.split('');
  const selectedVoiceDecodedAudioData =
      localVoices[$voiceSelector.value];
  const intervalInMilliseconds = calculateIntervalInMilliseconds();

  inputTextCharacters.forEach((
      inputTextCharacter,
      inputTextCharacterIndex
  ) => {
    if (inputTextCharacter === ' ') {
      addRandomIntervalInMilliseconds();
    }

    speakTimeoutsIds.push(setTimeout(() => {
      playDecodedAudioData(selectedVoiceDecodedAudioData);
    }, intervalInMilliseconds * inputTextCharacterIndex + randomIntervalsInMilliseconds));
  });
}

