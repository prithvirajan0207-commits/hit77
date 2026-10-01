/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroVoiceSection } from './components/HeroVoiceSection';
import { SchemeList } from './components/SchemeList';
import { LanguageModal } from './components/LanguageModal';
import { SakhiChatbot } from './components/SakhiChatbot';
import { SchemeDetailModal } from './components/SchemeDetailModal';
import { EligibilityChecker } from './components/EligibilityChecker';
import { HelplineFooter } from './components/HelplineFooter';
import { INDIAN_LANGUAGES, LanguageOption } from './data/languages';
import { Scheme } from './data/schemes';
import { stopSpeaking } from './utils/speech';
import { Mic, MessageSquare, Sparkles } from 'lucide-react';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(
    INDIAN_LANGUAGES[0] // Default to Hindi
  );

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Chatbot prefilled question
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string | undefined>(
    undefined
  );

  // Voice Query State on Hero Section
  const [isLoadingVoiceQuery, setIsLoadingVoiceQuery] = useState(false);
  const [latestVoiceAnswer, setLatestVoiceAnswer] = useState<{
    question: string;
    answer: string;
  } | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Ask a question from Hero voice / text section
  const handleAskVoiceQuestion = async (query: string) => {
    setIsLoadingVoiceQuery(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: currentLanguage.name,
          languageCode: currentLanguage.code,
        }),
      });

      const data = await res.json();
      const answer =
        data.reply ||
        'दीदी, मुझे आपका संदेश मिला। नज़दीकी पंचायत भवन या जन सेवा केंद्र में भी इसकी जानकारी मिल जाएगी।';

      setLatestVoiceAnswer({
        question: query,
        answer,
      });
      setIsSpeaking(true);
    } catch (err) {
      console.error('Error fetching voice answer:', err);
      setLatestVoiceAnswer({
        question: query,
        answer:
          'दीदी, नेटवर्क से संपर्क करने में थोड़ी दिक्कत हुई है। कृपया कुछ पलों बाद पुनः पूछें।',
      });
    } finally {
      setIsLoadingVoiceQuery(false);
    }
  };

  const handleAskAboutScheme = (schemeName: string, initialQ?: string) => {
    setChatInitialQuestion(initialQ || `मुझे ${schemeName} के बारे में बताएं।`);
    setIsChatOpen(true);
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50/40 text-slate-800 font-sans selection:bg-emerald-200">
      {/* Top Header Navigation */}
      <Header
        currentLanguage={currentLanguage}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenChat={() => {
          setChatInitialQuestion(undefined);
          setIsChatOpen(true);
        }}
        onOpenEligibility={() => setIsEligibilityOpen(true)}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Giant Non-Techy Voice Assistant Hero */}
        <HeroVoiceSection
          currentLanguage={currentLanguage}
          onAskQuestion={handleAskVoiceQuestion}
          isLoading={isLoadingVoiceQuery}
          latestAnswer={latestVoiceAnswer}
          onOpenChat={() => setIsChatOpen(true)}
        />

        {/* Feature Cards / Trust Banner */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-3 sm:-mt-6 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
              <span className="text-3xl">🗣️</span>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  बिना लिखे — सिर्फ बोलकर
                </h4>
                <p className="text-xs text-slate-500">
                  माइक दबाकर सवाल पूछें और जवाब सुनें
                </p>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-xs p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3">
              <span className="text-3xl">🇮🇳</span>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  अपनी मातृभाषा में
                </h4>
                <p className="text-xs text-slate-500">
                  हिन्दी, भोजपुरी, बांग्ला, मराठी सहित 21+ भाषाएं
                </p>
              </div>
            </div>

            <div
              onClick={() => setIsEligibilityOpen(true)}
              className="bg-emerald-800 text-white p-4 rounded-2xl shadow-sm hover:bg-emerald-900 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    मेरी पात्रता क्या है?
                  </h4>
                  <p className="text-xs text-emerald-200">
                    3 सरल सवालों में सही योजना जानें
                  </p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </section>

        {/* Directory of Government Schemes & Livelihood Skills */}
        <SchemeList
          currentLanguage={currentLanguage}
          onSelectScheme={(scheme) => setSelectedScheme(scheme)}
          onAskAboutScheme={handleAskAboutScheme}
        />
      </main>

      {/* Floating Bottom Action Bar for Easy Mobile Access */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 sm:hidden">
        <button
          onClick={() => {
            setChatInitialQuestion(undefined);
            setIsChatOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 hover:bg-emerald-800 cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <span>सखी चैटबॉट</span>
        </button>
      </div>

      {/* Government Helpline Footer */}
      <HelplineFooter />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={(lang) => {
          setCurrentLanguage(lang);
          // If latest answer was in another language, clear to avoid confusion
          setLatestVoiceAnswer(null);
        }}
      />

      {/* ChatGPT-like Sakhi Conversational Drawer */}
      <SakhiChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentLanguage={currentLanguage}
        initialQuestion={chatInitialQuestion}
      />

      {/* Scheme Detail Modal */}
      <SchemeDetailModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
        currentLanguage={currentLanguage}
        onAskAboutScheme={handleAskAboutScheme}
      />

      {/* Eligibility Questionnaire Modal */}
      <EligibilityChecker
        isOpen={isEligibilityOpen}
        onClose={() => setIsEligibilityOpen(false)}
        currentLanguage={currentLanguage}
        onSelectScheme={(scheme) => setSelectedScheme(scheme)}
      />
    </div>
  );
}
