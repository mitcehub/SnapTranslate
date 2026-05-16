import { TTS_LANG_MAP } from '../shared/constants.js';

let currentAudio = null;

function clearSpeakingBtn() {
  const btn = document.querySelector(".tr-speak-btn.speaking");
  if (btn) btn.classList.remove("speaking");
}

export function stopSpeak() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  clearSpeakingBtn();
}

export function speak(text, lang) {
  stopSpeak();
  const ttsLang = TTS_LANG_MAP[lang] || "en";

  if (window.speechSynthesis) {
    const voices = speechSynthesis.getVoices();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = ttsLang;
    utter.rate = 1;
    const matched = voices.find((v) => v.lang === ttsLang);
    if (matched) utter.voice = matched;
    utter.addEventListener("end", () => clearSpeakingBtn());
    utter.addEventListener("error", () => { clearSpeakingBtn(); speakGoogleTTS(text, ttsLang); });
    speechSynthesis.speak(utter);
    return;
  }

  speakGoogleTTS(text, ttsLang);
}

function speakGoogleTTS(text, lang) {
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=dict-chrome-ex`;
  const audio = new Audio(url);
  currentAudio = audio;
  const onDone = () => { currentAudio = null; clearSpeakingBtn(); };
  audio.addEventListener("ended", onDone);
  audio.addEventListener("error", onDone);
  audio.play().catch(onDone);
}
