import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Send, VolumeX, RotateCcw } from 'lucide-react';
import { LanguageOption } from '../data/languages';
import { getSpeechRecognition, speakText, stopSpeaking } from '../utils/speech';

interface HeroVoiceSectionProps {
  currentLanguage: LanguageOption;
  onAskQuestion: (query: string) => void;
  isLoading: boolean;
  latestAnswer?: { question: string; answer: string } | null;
  onOpenChat: () => void;
}

export const HeroVoiceSection: React.FC<HeroVoiceSectionProps> = ({
  currentLanguage,
  onAskQuestion,
  isLoading,
  latestAnswer,
  onOpenChat,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualText, setManualText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [isSpeakingAnswer, setIsSpeakingAnswer] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition with current language
  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage.speechCode || 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setRecognitionError('कृपया ब्राउज़र में माइक की अनुमति (Permission) दें।');
        } else if (event.error === 'no-speech') {
          setRecognitionError('कोई आवाज़ नहीं सुनाई दी। कृपया माइक दबाकर दोबारा बोलें।');
        } else {
          setRecognitionError('माइक शुरू नहीं हो पाया। नीचे दिए गए सवालों में से चुनें या लिखकर पूछें।');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition setup error:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [currentLanguage]);

  // When latestAnswer updates, offer audio read-out
  useEffect(() => {
    if (latestAnswer && latestAnswer.answer) {
      setIsSpeakingAnswer(true);
      speakText(latestAnswer.answer, currentLanguage.speechCode, () => {
        setIsSpeakingAnswer(false);
      });
    }
  }, [latestAnswer, currentLanguage]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      if (transcript.trim()) {
        onAskQuestion(transcript.trim());
        setTranscript('');
      }
    } else {
      stopSpeaking();
      setIsSpeakingAnswer(false);
      setTranscript('');
      setRecognitionError(null);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = currentLanguage.speechCode || 'hi-IN';
          recognitionRef.current.start();
        } catch (err) {
          console.error('Error starting recognition:', err);
          // Try re-instantiating if in invalid state
          const SpeechRecognitionClass = getSpeechRecognition();
          if (SpeechRecognitionClass) {
            const newRec = new SpeechRecognitionClass();
            newRec.lang = currentLanguage.speechCode || 'hi-IN';
            newRec.onresult = (e: any) => {
              setTranscript(e.results[0][0].transcript);
            };
            newRec.onend = () => setIsListening(false);
            newRec.start();
            setIsListening(true);
            recognitionRef.current = newRec;
          } else {
            setRecognitionError('इस ब्राउज़र में सीधा माइक उपलब्ध नहीं है। नीचे दिया सवाल छुएं या लिखें।');
          }
        }
      } else {
        setRecognitionError('माइक सपोर्ट उपलब्ध नहीं है। आप नीचे दिए गए सवाल दबाकर पूछ सकती हैं।');
      }
    }
  };

  const handleSendTranscript = () => {
    if (transcript.trim()) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      onAskQuestion(transcript.trim());
      setTranscript('');
    }
  };

  const handleQuickQuestion = (q: string) => {
    stopSpeaking();
    setIsSpeakingAnswer(false);
    onAskQuestion(q);
  };

  const handleReadAloudAnswer = () => {
    if (!latestAnswer) return;
    if (isSpeakingAnswer) {
      stopSpeaking();
      setIsSpeakingAnswer(false);
    } else {
      setIsSpeakingAnswer(true);
      speakText(latestAnswer.answer, currentLanguage.speechCode, () => {
        setIsSpeakingAnswer(false);
      });
    }
  };

  // Pre-configured friendly audio prompt chips in rural Hindi / translated
  const QUICK_QUESTIONS = [
    { text: 'मुझे सिलाई मशीन के ₹15,000 कैसे मिलेंगे?', icon: '🧵', tag: 'मुफ्त सिलाई' },
    { text: 'लखपति दीदी योजना में बिना ब्याज लोन कैसे लें?', icon: '💰', tag: '₹1-5 लाख लोन' },
    { text: 'गाय-भैंस डेयरी या बकरी पालन के लिए लोन', icon: '🐄', tag: 'पशुपालन सब्सिडी' },
    { text: 'मुफ्त उज्ज्वला गैस कनेक्शन कैसे मिलेगा?', icon: '🔥', tag: 'फ्री गैस चूल्हा' },
    { text: 'बेटी के लिए सुकन्या समृद्धि खाता कैसे खोलें?', icon: '👧', tag: '8.2% ब्याज' },
    { text: 'आयुष्मान कार्ड से ₹5 लाख का फ्री इलाज कैसे कराएं?', icon: '🏥', tag: 'मुफ्त इलाज' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/60 to-emerald-100/40 border-b border-emerald-100 py-8 sm:py-12">
      {/* Gentle decorative rural patterns */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Friendly Welcome Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300/70 text-emerald-900 text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
          <span className="text-base">🌸</span>
          <span>{currentLanguage.greeting}</span>
        </div>

        {/* Hero Title */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-emerald-950 font-serif tracking-tight leading-tight">
          कोई भी सरकारी योजना या हुनर{' '}
          <span className="text-emerald-700 underline decoration-emerald-400 decoration-wavy decoration-2">
            बोलकर पूछें
          </span>
        </h2>
        <p className="mt-2 sm:mt-3 text-sm sm:text-lg text-emerald-800 max-w-2xl mx-auto font-medium">
          टाइप करने की ज़रूरत नहीं! बस बड़ा हरा माइक दबाइए और अपनी भाषा में आराम से बोलिए।
        </p>

        {/* ============================================================== */}
        {/* BIG NON-TECHY VOICE SPEECH BUTTON (Hero Central Focal Point) */}
        {/* ============================================================== */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative group">
            {/* Animated pulsating wave rings when active */}
            {isListening && (
              <>
                <div className="absolute -inset-4 rounded-full bg-emerald-400/40 animate-ping opacity-75"></div>
                <div className="absolute -inset-8 rounded-full bg-emerald-300/30 animate-pulse"></div>
                <div className="absolute -inset-12 rounded-full bg-emerald-200/20"></div>
              </>
            )}

            {/* Giant tactile circular button */}
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`relative z-20 w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer select-none ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-rose-600/40 ring-8 ring-rose-200'
                  : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-emerald-500 text-white shadow-emerald-700/35 hover:shadow-emerald-700/50 hover:scale-105 ring-8 ring-emerald-100'
              }`}
              aria-label={isListening ? 'बोलना बंद करें' : 'बोलकर पूछें'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse stroke-[2.2]" />
                  <span className="text-xs sm:text-sm font-bold tracking-wide mt-1 uppercase">
                    रुकें (Stop)
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.2]" />
                  <span className="text-xs sm:text-sm font-bold tracking-wide mt-1">
                    माइक दबाएं
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Friendly status banner under button */}
          <div className="mt-4">
            {isListening ? (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-100 text-rose-800 text-sm sm:text-base font-bold shadow-xs animate-bounce">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                <span>दीदी, हम ध्यान से सुन रहे हैं... अपनी बात बोलिए!</span>
              </div>
            ) : isLoading ? (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-900 text-sm sm:text-base font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-700 animate-spin" />
                <span>सखी दीदी जवाब ढूंढ रही हैं... एक पल रुकें!</span>
              </div>
            ) : (
              <p className="text-sm sm:text-base font-semibold text-emerald-900 bg-white/90 px-4 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
                👆 {currentLanguage.micPrompt}
              </p>
            )}
          </div>

          {/* Live Transcript Bubble */}
          {transcript && (
            <div className="mt-4 w-full max-w-lg mx-auto p-4 rounded-2xl bg-white border-2 border-emerald-500 shadow-lg text-left animate-in fade-in slide-in-from-bottom-2">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                आपने कहा:
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-800">
                "{transcript}"
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setTranscript('')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100"
                >
                  दोबारा बोलें
                </button>
                <button
                  onClick={handleSendTranscript}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-emerald-800 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>सखी से पूछें</span>
                </button>
              </div>
            </div>
          )}

          {/* Microphone permission or error note */}
          {recognitionError && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm max-w-md mx-auto">
              <span>{recognitionError}</span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* LATEST VOICE ANSWER BOX (With Big Speaker Button for Read-Aloud) */}
        {/* ============================================================== */}
        {latestAnswer && (
          <div className="my-6 p-5 sm:p-6 rounded-3xl bg-white border-2 border-emerald-500/40 shadow-xl text-left relative overflow-hidden transition-all animate-in zoom-in-95">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  🧕
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-emerald-950 font-serif">
                    सखी सहेली का जवाब
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">
                    सवाल: "{latestAnswer.question}"
                  </p>
                </div>
              </div>

              {/* Big Read-Aloud / Speaker Button */}
              <button
                onClick={handleReadAloudAnswer}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
                  isSpeakingAnswer
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 ring-2 ring-rose-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSpeakingAnswer ? (
                  <>
                    <VolumeX className="w-4 h-4 animate-pulse text-rose-600" />
                    <span>आवाज़ रोकें (Stop)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-100" />
                    <span>बोलकर सुनाएं (Listen)</span>
                  </>
                )}
              </button>
            </div>

            {/* Answer body with large legible text */}
            <div className="prose prose-emerald max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
              {latestAnswer.answer}
            </div>

            {/* Action buttons inside answer box */}
            <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-emerald-800 font-medium">
                💡 और सवाल पूछने के लिए माइक दबाएं या चैट खोलें
              </span>
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold hover:bg-emerald-100 cursor-pointer"
              >
                <span>चैट में आगे बात करें →</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUICK TAP-TO-ASK VOICE CARDS (Non-Techy Shortcuts) */}
        {/* ============================================================== */}
        <div className="mt-6 text-left">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
              <span>👉</span>
              <span>या सीधा छुएं — सबसे ज़्यादा पूछे जाने वाले सवाल:</span>
            </h3>
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2 cursor-pointer"
            >
              {showTextInput ? 'कीबोर्ड छुपाएं' : 'लिखकर पूछना है? (Type)'}
            </button>
          </div>

          {/* Quick Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {QUICK_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(item.text)}
                disabled={isLoading}
                className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/80 border border-emerald-200/80 hover:border-emerald-400 text-left transition-all shadow-xs hover:shadow-md flex items-center gap-3 group cursor-pointer"
              >
                <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    {item.tag}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-emerald-950 line-clamp-2">
                    {item.text}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Optional Direct Text Input Bar */}
          {showTextInput && (
            <div className="mt-4 p-3 bg-white rounded-2xl border-2 border-emerald-400 shadow-sm flex items-center gap-2 animate-in fade-in">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && manualText.trim()) {
                    handleQuickQuestion(manualText.trim());
                    setManualText('');
                  }
                }}
                placeholder="यहाँ अपना सवाल लिखें (जैसे: राशन कार्ड से क्या लाभ मिलेगा?)"
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none px-2"
              />
              <button
                onClick={() => {
                  if (manualText.trim()) {
                    handleQuickQuestion(manualText.trim());
                    setManualText('');
                  }
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                भेजें
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
