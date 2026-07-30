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
  vi: "vi-VN",
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

async function speakViaServer(
  text: string,
  lang: string,
  awaitEnd = false,
): Promise<boolean> {
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
    const cleanup = () => URL.revokeObjectURL(url);
    await audio.play();
    // awaitEnd: chỉ resolve khi phát XONG (hoặc bị cắt ngang) — để nơi gọi chờ
    // đọc hết rồi mới làm bước sau (vd chuyển câu).
    if (awaitEnd) {
      await new Promise<void>((resolve) => {
        const done = () => {
          cleanup();
          resolve();
        };
        audio.onended = done;
        audio.onerror = done;
        audio.onpause = () => resolve(); // stopSpeaking() cắt ngang → thôi chờ
      });
    } else {
      audio.onended = audio.onerror = cleanup;
    }
    return true;
  } catch {
    return false;
  }
}

function speakViaBrowser(text: string, lang: string, awaitEnd = false): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();

    const bcp = BROWSER_LANG[lang] ?? lang;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = bcp;
    u.rate = 0.85; // chậm rãi cho bé dễ nghe theo
    u.pitch = 1.1;
    if (awaitEnd) u.onend = u.onerror = () => resolve();

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

    if (!awaitEnd) resolve(); // không chờ → trả về ngay
  });
}

/**
 * Đọc `text` bằng giọng tự nhiên nhất hiện có. `lang`: "en" | "zh" | "vi"…
 * `browserOnly`: bỏ qua Google TTS, dùng thẳng giọng trình duyệt — cần cho
 * tiếng Việt vì server chỉ cấu hình giọng Anh/Trung (đọc "vi" sẽ sai âm).
 */
export async function speak(
  text: string,
  lang: string = "en",
  opts?: { browserOnly?: boolean; awaitEnd?: boolean },
) {
  stopSpeaking();
  const awaitEnd = opts?.awaitEnd ?? false;
  if (opts?.browserOnly) {
    await speakViaBrowser(text, lang, awaitEnd);
    return;
  }
  const ok = await speakViaServer(text, lang, awaitEnd);
  if (!ok) await speakViaBrowser(text, lang, awaitEnd);
}
