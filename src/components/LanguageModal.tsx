import React, { useState } from 'react';
import { X, Search, Volume2, Check, Globe } from 'lucide-react';
import { INDIAN_LANGUAGES, LanguageOption } from '../data/languages';
import { speakText, stopSpeaking } from '../utils/speech';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreviewVoice = (e: React.MouseEvent, lang: LanguageOption) => {
    e.stopPropagation();
    stopSpeaking();
    speakText(lang.greeting, lang.speechCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Globe className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                अपनी भाषा चुनें (Select Your Language)
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                भारत की सभी प्रमुख भाषाएं व ग्रामीण बोलियां उपलब्ध हैं
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-emerald-100 bg-emerald-50/50">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" />
            <input
              type="text"
              placeholder="भाषा खोजें (Search language, e.g. Hindi, Bengali, Bhojpuri, Marathi...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLanguage.code === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang);
                  speakText(lang.greeting, lang.speechCode);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all flex items-center justify-between group hover:scale-[1.01] ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/90 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white'
                }`}
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-emerald-950 font-serif tracking-wide">
                      {lang.nativeName}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                    {lang.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {lang.region}
                  </div>
                </div>

                {/* Speaker icon to preview audio greeting */}
                <button
                  onClick={(e) => handlePreviewVoice(e, lang)}
                  title="नमस्ते सुनें (Listen greeting)"
                  className="w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
          <span>
            💡 किसी भी भाषा पर क्लिक करें, ऐप उसी भाषा में काम करेगा
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs"
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
