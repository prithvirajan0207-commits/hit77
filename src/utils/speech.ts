// Audio and Web Speech utilities for rural multilingual accessibility

export interface SpeechRecognitionHookState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

// Get the browser SpeechRecognition constructor
export function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
}

// Speak text aloud using SpeechSynthesis
export function speakText(
  text: string,
  langCode: string = 'hi-IN',
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean markdown/symbols from text so speech reads smoothly
    const cleanText = text
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = 0.95; // Slightly slower, calm and clear for rural elder/women listeners
    utterance.pitch = 1.05; // Friendly warm pitch

    // Try finding the best matching voice
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.split('-')[0].toLowerCase();
    const matchingVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith(prefix) ||
        v.lang.toLowerCase() === langCode.toLowerCase()
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    return false;
  }
}

// Stop any currently speaking speech
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Check if currently speaking
export function isCurrentlySpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
