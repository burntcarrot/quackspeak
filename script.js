(async () => {
  /**
   * An object containing the decoded audio data of the voices that are
   * stored locally in the server.
   */
  const localVoicesDecodedAudioData = {
    quack: await createDecodedAudioDataFromVoiceFile('quack.mp3'),
    bark: await createDecodedAudioDataFromVoiceFile('bark.wav'),
    meow: await createDecodedAudioDataFromVoiceFile('meow.wav'),
  };
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

  $sayItButton.addEventListener('pointerdown', speak);

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
   * If the $pitchSlider has not been changed, it returns 1 by default, that is
   * the value set in the HTML page.
   *
   * @returns {number} The pitch rate.
   */
  function calculatePitchRate() {
    return 0.4 * 4 ** $pitchSlider.value + 0.2;
  }

  /**
   * Returns the speak interval based in the value of the $intervalSlider element
   * in the page.
   *
   * If the $intervalSlider has not been changed, it returns 175 by default,
   * that is the value set in the HTML page.
   *
   * @returns {number} The interval in miliseconds.
   */
  function calculateIntervalInMiliseconds() {
    return $intervalSlider.value;
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
    if (speakTimeoutsIds.length > 0) {
      speakTimeoutsIds.forEach((speakTimeoutId) => {
        clearTimeout(speakTimeoutId);
      });
      speakTimeoutsIds = [];
    }
  }

  /**
   * Creates and plays a speak with the input text inserted in the $inputText
   * element.
   */
  function speak() {
    cancelPreviousSpeakTimeouts();

    const inputText = getInputText();
    const selectedVoiceDecodedAudioData =
        localVoicesDecodedAudioData[$voiceSelector.value];
    const numberOfCharacters = inputText.length;
    const intervalInMiliseconds = calculateIntervalInMiliseconds();

    /**
     * TODO: add a way to put each character in the $dialogueText element.
     */
    for (
        let characterIndex = 0;
        characterIndex < numberOfCharacters;
        characterIndex++
    ) {
      speakTimeoutsIds.push(setTimeout(() => {
        playDecodedAudioData(selectedVoiceDecodedAudioData);
      }, intervalInMiliseconds * characterIndex));
    }
  }
})();

