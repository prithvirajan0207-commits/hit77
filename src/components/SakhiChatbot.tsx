import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Share2,
  RotateCcw,
  Sparkles,
  User,
  Check,
} from 'lucide-react';
import { LanguageOption } from '../data/languages';
import { getSpeechRecognition, speakText, stopSpeaking } from '../utils/speech';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isAudioPlaying?: boolean;
}

interface SakhiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageOption;
  initialQuestion?: string;
}

export const SakhiChatbot: React.FC<SakhiChatbotProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  initialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'bot',
      text: `${currentLanguage.greeting} मैं आपकी डिजिटल सहेली हूँ।\n\nआप मुझसे किसी भी सरकारी योजना (लखपति दीदी, सिलाई मशीन, उज्ज्वला, सुकन्या, मुद्रा लोन), हुनर सीखने या आजीविका शुरू करने के बारे में बेझिझक पूछ सकती हैं।\n\nआप बोलकर भी पूछ सकती हैं या लिखकर भी! 🌸`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // If opened with an initial question from outside
  useEffect(() => {
    if (isOpen && initialQuestion) {
      handleSendMessage(initialQuestion);
    }
  }, [isOpen, initialQuestion]);

  // Handle Speech Recognition for chat
  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage.speechCode || 'hi-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        setInputText(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Chat recognition setup error:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [currentLanguage]);

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
    } else {
      stopSpeaking();
      setPlayingMessageId(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = currentLanguage.speechCode || 'hi-IN';
          recognitionRef.current.start();
        } catch (_) {
          setIsListening(false);
        }
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    stopSpeaking();
    setPlayingMessageId(null);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for API
      const history = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: currentLanguage.name,
          languageCode: currentLanguage.code,
          history,
        }),
      });

      const data = await res.json();
      const botText =
        data.reply ||
        'दीदी, मुझे आपका संदेश मिला। नज़दीकी पंचायत भवन या जन सेवा केंद्र में भी इसकी जानकारी मिल जाएगी।';

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Automatically speak the response aloud in her language
      setPlayingMessageId(botMessage.id);
      speakText(botText, currentLanguage.speechCode, () => {
        setPlayingMessageId(null);
      });
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'दीदी, इंटरनेट या सर्वर से जुड़ने में परेशानी हुई है। कृपया कुछ पलों बाद पुनः पूछें।',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeakMessage = (msg: ChatMessage) => {
    if (playingMessageId === msg.id) {
      stopSpeaking();
      setPlayingMessageId(null);
    } else {
      stopSpeaking();
      setPlayingMessageId(msg.id);
      speakText(msg.text, currentLanguage.speechCode, () => {
        setPlayingMessageId(null);
      });
    }
  };

  const handleShareWhatsApp = (text: string) => {
    const shareText = `*सखी सहेली - ग्रामीण महिला सहायता:*\n\n${text}\n\n_सखी सहेली ऐप द्वारा प्रेषित_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    stopSpeaking();
    setPlayingMessageId(null);
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `${currentLanguage.greeting} चैट साफ़ हो गई है। आप कोई भी नया सवाल पूछ सकती हैं। 🌸`,
        timestamp: new Date(),
      },
    ]);
  };

  // Quick Chips inside chatbot
  const CHIP_PROMPTS = [
    'कागज़ात क्या-क्या चाहिए?',
    'फॉर्म कहाँ जमा करना है?',
    'स्वयं सहायता समूह में कैसे जुड़ें?',
    'बिना ब्याज लोन की पूरी जानकारी',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      {/* Sliding full-height chat drawer */}
      <div className="w-full sm:max-w-xl h-full bg-emerald-50/50 flex flex-col shadow-2xl border-l border-emerald-100 bg-white">
        {/* Chatbot Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl backdrop-blur-xs border border-white/20">
                🧕
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-emerald-800"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight">
                  सखी दीदी (Sakhi Didi)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  AI सहेली
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                आपकी भाषा: <span className="underline font-bold">{currentLanguage.nativeName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              title="चैट साफ़ करें (Reset)"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              title="बंद करें (Close)"
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-emerald-50/30">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            const isPlayingThis = playingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-1`}
              >
                {/* Bot Avatar */}
                {isBot && (
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 text-base shadow-xs mt-1">
                    🧕
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed shadow-xs transition-all ${
                    isBot
                      ? 'bg-white text-slate-800 border border-emerald-200/90 rounded-tl-xs'
                      : 'bg-emerald-700 text-white rounded-tr-xs font-medium'
                  }`}
                >
                  {/* Text Content */}
                  <div className="whitespace-pre-line break-words">
                    {msg.text}
                  </div>

                  {/* Bot Message Bottom Bar: Read Aloud + Share */}
                  {isBot && (
                    <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                      {/* Big Read Aloud button */}
                      <button
                        onClick={() => handleToggleSpeakMessage(msg)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                          isPlayingThis
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {isPlayingThis ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                            <span>आवाज़ रोकें</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>सुनें (Listen)</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1 text-slate-400">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          title="कॉपी करें"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span className="text-[11px] font-medium">कॉपी</span>
                          )}
                        </button>

                        {/* WhatsApp Share */}
                        <button
                          onClick={() => handleShareWhatsApp(msg.text)}
                          title="व्हाट्सएप पर सहेली को भेजें"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold"
                        >
                          <Share2 className="w-3 h-3 text-emerald-700" />
                          <span>भेजें</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isBot && (
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-base shadow-xs mt-1">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-base">
                🧕
              </div>
              <div className="bg-white border border-emerald-200 px-4 py-3 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs sm:text-sm text-emerald-800 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>सखी दीदी जवाब सोच रही हैं...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-emerald-50/80 border-t border-emerald-100 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-bold text-emerald-900 shrink-0">
            झटपट सवाल:
          </span>
          {CHIP_PROMPTS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1 rounded-full bg-white border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100/60 text-xs font-medium text-emerald-900 shrink-0 transition-colors cursor-pointer shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Input Bar with Big Mic Button */}
        <div className="p-3 sm:p-4 bg-white border-t border-emerald-100 shrink-0">
          {isListening && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between animate-pulse">
              <span>🎙️ आपकी आवाज़ सुनी जा रही है... बोलिए दीदी</span>
              <button
                onClick={toggleVoiceInput}
                className="underline hover:text-rose-900"
              >
                रुकें
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* BIG NON-TECHY MIC BUTTON IN CHAT */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              title={isListening ? 'माइक बंद करें' : 'माइक से बोलें'}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-md ${
                isListening
                  ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105'
              }`}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 stroke-[2.2]" />
              ) : (
                <Mic className="w-6 h-6 stroke-[2.2]" />
              )}
            </button>

            {/* Simple Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="यहाँ अपनी बात लिखें या बायां हरा माइक दबाएं..."
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-2xl border-2 border-emerald-200 focus:border-emerald-600 focus:outline-none text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-emerald-50/20"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-12 h-12 rounded-2xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-sm"
              aria-label="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
