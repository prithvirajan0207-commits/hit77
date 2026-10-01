import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  FileCheck2,
  MapPin,
  Phone,
  Sparkles,
  Share2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Scheme } from '../data/schemes';
import { LanguageOption } from '../data/languages';
import { speakText, stopSpeaking } from '../utils/speech';

interface SchemeDetailModalProps {
  scheme: Scheme | null;
  onClose: () => void;
  currentLanguage: LanguageOption;
  onAskAboutScheme: (schemeName: string, initialQ?: string) => void;
}

export const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({
  scheme,
  onClose,
  currentLanguage,
  onAskAboutScheme,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!scheme) return null;

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const fullText = `${scheme.name.hi}। ${scheme.highlightBenefit}। ${scheme.detailedBenefit}। पात्रता: ${scheme.whoCanApply}। जरूरी कागज़ात: ${scheme.requiredDocuments.join(', ')}। आवेदन के लिए: ${scheme.whereToApply.office}, ${scheme.whereToApply.personToMeet} से मिलें।`;
      speakText(fullText, currentLanguage.speechCode, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleShare = () => {
    const text = `*${scheme.name.hi}*\n\nमुख्य लाभ: ${scheme.highlightBenefit}\n\nकहाँ जाएं: ${scheme.whereToApply.office}\nहेल्पलाइन: ${scheme.helpline}\n\n_सखी सहेली ऐप से प्राप्त_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
              {scheme.categoryLabel.hi}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
              {scheme.name.hi}
            </h2>
            <p className="text-xs text-emerald-100 font-medium mt-1">
              {scheme.name.en}
            </p>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action strip with Audio Read-out */}
        <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between flex-wrap gap-2">
          {/* Big Speaker Button */}
          <button
            onClick={handleToggleSpeak}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
              isSpeaking
                ? 'bg-rose-100 text-rose-700 border border-rose-300'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 animate-pulse text-rose-600" />
                <span>आवाज़ रोकें (Stop)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>पूरी जानकारी बोलकर सुनें (Listen)</span>
              </>
            )}
          </button>

          {/* Share on WhatsApp */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-100/60 text-xs font-semibold cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>सहेली को भेजें (Share)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Key Benefit Highlight Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              मुख्य सरकारी लाभ (Key Benefit)
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-950 mt-1">
              {scheme.highlightBenefit}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-2 leading-relaxed">
              {scheme.detailedBenefit}
            </p>
          </div>

          {/* Who Can Apply (Eligibility) */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                ✓
              </span>
              <span>कौन आवेदन कर सकती हैं? (पात्रता / Eligibility)</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed pl-8">
              {scheme.whoCanApply}
            </p>
          </div>

          {/* Required Documents (Checklist) */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-3">
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
              <span>क्या-क्या कागज़ात लगेंगे? (Required Documents)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
              {scheme.requiredDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/50 text-xs sm:text-sm font-medium text-slate-800 border border-emerald-100/70"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                    ✓
                  </span>
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Where to Go (Exact Office & Person) */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <span>कहाँ जाना होगा व किससे मिलना होगा?</span>
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 pl-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900">कार्यालय / स्थान: </span>
                {scheme.whereToApply.office}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900">किससे मिलें: </span>
                {scheme.whereToApply.personToMeet}
              </div>
              {scheme.whereToApply.onlinePortal && (
                <div className="p-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>आधिकारिक वेबसाइट: {scheme.whereToApply.onlinePortal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Helpline and Toll-Free Contact */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-700" />
                <span>निःशुल्क सरकारी फोन नंबर (Toll-Free Helpline)</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-amber-950 mt-0.5">
                {scheme.helpline}
              </div>
            </div>
            <a
              href={`tel:${scheme.helpline.split('/')[0].trim()}`}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs"
            >
              फोन लगाएं
            </a>
          </div>

          {/* Voice sample questions */}
          <div>
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
              इस योजना के बारे में सखी दीदी से पूछें:
            </div>
            <div className="space-y-2">
              {scheme.voiceQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    stopSpeaking();
                    onClose();
                    onAskAboutScheme(scheme.name.hi, q);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-950 flex items-center justify-between cursor-pointer"
                >
                  <span>🗣️ "{q}"</span>
                  <span className="text-emerald-700 text-xs">पूछें →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-white"
          >
            बंद करें
          </button>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
              onAskAboutScheme(scheme.name.hi, `मुझे ${scheme.name.hi} के बारे में विस्तार से बताएं।`);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>सखी दीदी से चैट करें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
