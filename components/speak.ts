// Đọc một câu (tiếng Anh / tiếng Trung…) cho bé nghe.
// Ưu tiên Google Cloud TTS qua /api/tts (giọng tự nhiên) nếu server có cấu hình
// khoá; không có thì rớt về Web Speech API sẵn trong trình duyệt — miễn phí,
// chạy offline, không cần cài đặt gì. Xem chi tiết cơ chế trong app/api/tts.

let currentAudio: HTMLAudioElement | null = null;
let serverTTS: boolean | null = null; // null = chưa dò, true/false = kết quả dò

// Mã ngôn ngữ dùng cho Web Speech (BCP-47). "zh" → giọng Quan thoại.
const BROWSER_LANG: Record<string, string> = {
  en: "en-US",
  zh: "zh-CN",
};

/** Dừng mọi âm thanh đang phát (cả file lẫn Web Speech). */
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

async function speakViaServer(text: string, lang: string): Promise<boolean> {
  if (serverTTS === false) return false; // đã biết server không có TTS → khỏi gọi
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, lang }),
    });
    if (res.status === 501) {
      serverTTS = false; // server chưa cấu hình khoá → dùng trình duyệt từ giờ
      return false;
    }
    if (!res.ok) return false;
    serverTTS = true;

    const url = URL.createObjectURL(await res.blob());
    stopSpeaking();
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = audio.onerror = () => URL.revokeObjectURL(url);
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

function speakViaBrowser(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();

  const bcp = BROWSER_LANG[lang] ?? lang;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = bcp;
  u.rate = 0.85; // chậm rãi cho bé dễ nghe theo
  u.pitch = 1.1;

  const speakNow = () => {
    const voices = synth.getVoices();
    const base = bcp.slice(0, 2).toLowerCase();
    const voice =
      voices.find((v) => v.lang.toLowerCase().startsWith(bcp.toLowerCase())) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(base));
    if (voice) u.voice = voice;
    synth.speak(u);
  };

  // Trên một số máy danh sách giọng nạp không đồng bộ.
  if (synth.getVoices().length) speakNow();
  else synth.onvoiceschanged = speakNow;
}

/** Đọc `text` bằng giọng tự nhiên nhất hiện có. `lang`: "en" | "zh"… */
export async function speak(text: string, lang: string = "en") {
  stopSpeaking();
  const ok = await speakViaServer(text, lang);
  if (!ok) speakViaBrowser(text, lang);
}
