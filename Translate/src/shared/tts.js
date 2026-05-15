import { TTS_LANG_MAP } from '../shared/constants.js';

let currentAudio = null;

export function stopSpeak() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  const playing = document.querySelector(".tr-speak-btn.speaking");
  if (playing) playing.classList.remove("speaking");
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
    utter.addEventListener("end", () => {
      const btn = document.querySelector(".tr-speak-btn.speaking");
      if (btn) btn.classList.remove("speaking");
    });
    utter.addEventListener("error", () => {
      speakGoogleTTS(text, ttsLang);
    });
    speechSynthesis.speak(utter);
    return;
  }

  speakGoogleTTS(text, ttsLang);
}

function speakGoogleTTS(text, lang) {
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=dict-chrome-ex`;
  const audio = new Audio(url);
  currentAudio = audio;
  audio.addEventListener("ended", () => {
    currentAudio = null;
    const btn = document.querySelector(".tr-speak-btn.speaking");
    if (btn) btn.classList.remove("speaking");
  });
  audio.addEventListener("error", () => {
    currentAudio = null;
    const btn = document.querySelector(".tr-speak-btn.speaking");
    if (btn) btn.classList.remove("speaking");
  });
  audio.play().catch(() => {
    currentAudio = null;
    const btn = document.querySelector(".tr-speak-btn.speaking");
    if (btn) btn.classList.remove("speaking");
  });
}
