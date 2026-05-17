let currentAudio = null;

function clearSpeakingBtn() {
  document.querySelectorAll(".tr-speak-btn.speaking").forEach((btn) => btn.classList.remove("speaking"));
}

function stopSpeak() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; currentAudio = null; }
  clearSpeakingBtn();
}

async function isRemoteTTSAllowed() {
  try {
    if (typeof GM_getValue !== 'undefined') {
      const s = GM_getValue('settings');
      if (s) return JSON.parse(s).allowRemoteTTS === true;
    }
    return false;
  } catch { return false; }
}

function speak(text, lang) {
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
    utter.addEventListener("error", async () => {
      clearSpeakingBtn();
      if (await isRemoteTTSAllowed()) {
        speakGoogleTTS(text, ttsLang);
      }
    });
    speechSynthesis.speak(utter);
    return;
  }

  isRemoteTTSAllowed().then((allowed) => {
    if (allowed) speakGoogleTTS(text, ttsLang);
  });
}

function speakGoogleTTS(text, lang) {
  const truncated = text.length > 200 ? text.substring(0, 200) : text;
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncated)}&tl=${lang}&client=dict-chrome-ex`;
  const audio = new Audio(url);
  currentAudio = audio;
  const onDone = () => { currentAudio = null; clearSpeakingBtn(); };
  audio.addEventListener("ended", onDone);
  audio.addEventListener("error", onDone);
  audio.play().catch(onDone);
}
