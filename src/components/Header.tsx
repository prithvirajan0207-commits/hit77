import React from 'react';
import { Globe, Phone, VolumeX, MessageSquare, Sparkles } from 'lucide-react';
import { LanguageOption } from '../data/languages';
import { stopSpeaking } from '../utils/speech';

interface HeaderProps {
  currentLanguage: LanguageOption;
  onOpenLanguageModal: () => void;
  onOpenChat: () => void;
  onOpenEligibility: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onOpenLanguageModal,
  onOpenChat,
  onOpenEligibility,
  isSpeaking,
  onStopSpeaking,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <span className="text-2xl" role="img" aria-label="Sakhi Saheli">
              🧕
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 font-serif leading-none">
                सखी सहेली
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full">
                ग्रामीण महिला साथी
              </span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">
              सरकारी योजनाएं, हुनर व लोन — आपकी अपनी भाषा में
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Speaking Indicator */}
          {isSpeaking && (
            <button
              onClick={() => {
                stopSpeaking();
                onStopSpeaking();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 animate-pulse transition-all cursor-pointer"
              title="आवाज बंद करें (Stop Audio)"
            >
              <VolumeX className="w-4 h-4 text-rose-600" />
              <span className="hidden md:inline">आवाज रोकें</span>
            </button>
          )}

          {/* Eligibility Checker Quick Link */}
          <button
            onClick={onOpenEligibility}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>पात्रता जांचें</span>
          </button>

          {/* Ask AI / Chatbot CTA */}
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-semibold">सखी चैटबॉट</span>
          </button>

          {/* Language Selector Button */}
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border-2 border-emerald-600 text-emerald-900 font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            aria-label="Change Language"
          >
            <Globe className="w-4 h-4 text-emerald-700" />
            <span className="text-emerald-950 font-bold">
              {currentLanguage.nativeName}
            </span>
            <span className="text-[10px] text-emerald-600 hidden sm:inline">
              (बदलें)
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
