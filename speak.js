/** @type {HTMLTextAreaElement} */
const $inputText = document.querySelector('.js-input-text');
/** @type {HTMLDivElement} */
const $dialogueText = document.querySelector('.js-dialogue-text');
/** @type {HTMLInputElement} */
const $pitchSlider = document.querySelector('.js-pitch-slider');
/** @type {HTMLInputElement} */
const $intervalSlider = document.querySelector('.js-interval-slider');
const $voiceSelector = document.querySelector('.js-voice-selector');

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
 * Plays the audio from the decoded audio data.
 *
 * @param {AudioBuffer} decodedAudioData An audio buffer that contains the
 * decoded audio data. It may be a result of the function
 * `createDecodedAudioDataFromVoiceFile`.
 *
 * @param {number} The pitch rate to be used when playing the audio data.
 */
function playDecodedAudioData(decodedAudioData, pitchRate) {
  const audioContext = new AudioContext();
  const source = audioContext.createBufferSource();

  source.buffer = decodedAudioData;
  source.playbackRate.value = pitchRate;
  source.connect(audioContext.destination);
  source.start();
}

/**
 * Creates and plays a speak with the input text inserted in the $inputText
 * element.
 */
async function speak() {
  /**
   * An object containing the decoded audio data of the voices that are
   * stored locally in the server.
   */
  const localVoicesDecodedAudioData = {
    quack: await createDecodedAudioDataFromVoiceFile('quack.mp3'),
    santa: await createDecodedAudioDataFromVoiceFile('santa.wav'),
    bark: await createDecodedAudioDataFromVoiceFile('bark.wav'),
    meow: await createDecodedAudioDataFromVoiceFile('meow.wav'),
    moo: await createDecodedAudioDataFromVoiceFile('moo.mp3'),
    woof: await createDecodedAudioDataFromVoiceFile('woof.mp3'),
  };
  const inputText = getInputText();
  const selectedVoiceDecodedAudioData =
      localVoicesDecodedAudioData[$voiceSelector.value];
  const pitchRate = calculatePitchRate();
}

