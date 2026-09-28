export function spokenQueueNumber(value: string) {
  const digits: Record<string, string> = {
    "0": "nol", "1": "satu", "2": "dua", "3": "tiga", "4": "empat",
    "5": "lima", "6": "enam", "7": "tujuh", "8": "delapan", "9": "sembilan",
  };
  return [...value.toUpperCase()].map((character) => digits[character] ?? character).join(" ");
}

export function queueAnnouncementText(queueNumber: string, roomLabel: string) {
  return `Nomor antrean ${spokenQueueNumber(queueNumber)}, silakan menuju ${roomLabel}.`;
}

export function prepareQueueSpeech() {
  if (!("speechSynthesis" in window)) return false;
  try {
    window.speechSynthesis.cancel();
    const activation = new SpeechSynthesisUtterance("");
    activation.volume = 0;
    window.speechSynthesis.speak(activation);
    return true;
  } catch {
    return false;
  }
}

export function speakQueueAnnouncement(queueNumber: string, roomLabel: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Browser ini tidak mendukung suara panggilan."));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(queueAnnouncementText(queueNumber, roomLabel));
    utterance.lang = "id-ID";
    utterance.rate = 0.88;
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith("id"));
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Suara tidak dapat diputar. Periksa volume dan keluaran speaker perangkat ini."));
    window.speechSynthesis.speak(utterance);
  });
}
