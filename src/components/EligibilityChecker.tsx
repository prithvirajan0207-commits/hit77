import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SCHEMES_DATA, Scheme } from '../data/schemes';
import { LanguageOption } from '../data/languages';
import { speakText, stopSpeaking } from '../utils/speech';

interface EligibilityCheckerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageOption;
  onSelectScheme: (scheme: Scheme) => void;
}

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectScheme,
}) => {
  const [rationCard, setRationCard] = useState<string>('');
  const [shgMember, setShgMember] = useState<string>('');
  const [workPreference, setWorkPreference] = useState<string>('');
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[] | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const handleCheck = () => {
    stopSpeaking();
    setIsSpeaking(false);

    let matches: Scheme[] = [];

    // Prioritize based on selection
    if (workPreference === 'sewing') {
      matches.push(
        SCHEMES_DATA.find((s) => s.id === 'free-sewing-machine-vishwakarma')!
      );
    } else if (workPreference === 'dairy') {
      matches.push(
        SCHEMES_DATA.find((s) => s.id === 'dairy-pashudhan-subsidy')!
      );
    } else if (workPreference === 'shop') {
      matches.push(
        SCHEMES_DATA.find((s) => s.id === 'pm-mudra-shishu')!
      );
    } else if (workPreference === 'food') {
      matches.push(
        SCHEMES_DATA.find((s) => s.id === 'food-handicrafts-microenterprise')!
      );
    } else if (workPreference === 'drone') {
      matches.push(
        SCHEMES_DATA.find((s) => s.id === 'drone-didi-krishi-sakhi')!
      );
    }

    if (shgMember === 'yes' || shgMember === 'want_to_join') {
      matches.push(SCHEMES_DATA.find((s) => s.id === 'lakhpati-didi')!);
    }

    if (rationCard === 'antyodaya' || rationCard === 'bpl') {
      matches.push(SCHEMES_DATA.find((s) => s.id === 'pm-ujjwala')!);
      matches.push(SCHEMES_DATA.find((s) => s.id === 'ayushman-bharat')!);
    }

    // Always include a girl child / maternal or Mudra if still short
    if (matches.length < 3) {
      matches.push(SCHEMES_DATA.find((s) => s.id === 'sukanya-samriddhi')!);
    }

    // Deduplicate and filter non-null
    const unique = Array.from(new Set(matches.filter(Boolean)));
    setMatchedSchemes(unique.slice(0, 4));

    // Audio announce
    const audioText = `दीदी, आपकी जानकारी के अनुसार आपके लिए ${unique.length} सबसे बढ़िया योजनाएं मिली हैं। सबसे पहले है ${unique[0]?.name.hi}।`;
    speakText(audioText, currentLanguage.speechCode);
  };

  const handleReset = () => {
    stopSpeaking();
    setRationCard('');
    setShgMember('');
    setWorkPreference('');
    setMatchedSchemes(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif">
                पात्रता जांचें (Eligibility Check)
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                3 सरल सवालों का जवाब दें और अपने लिए सबसे सही योजना जानें
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Questionnaire Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!matchedSchemes ? (
            <>
              {/* Question 1: Ration Card */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-emerald-950 mb-2.5">
                  1. क्या आपके परिवार के पास राशन कार्ड है?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'bpl', label: 'हाँ (सफेद / पात्र गृहस्थी)' },
                    { id: 'antyodaya', label: 'हाँ (पीला / अंत्योदय कार्ड)' },
                    { id: 'none', label: 'नहीं / अभी नहीं बना' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setRationCard(opt.id)}
                      className={`p-3 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        rationCard === opt.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-emerald-300 bg-white text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: SHG Membership */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-emerald-950 mb-2.5">
                  2. क्या आप किसी स्वयं सहायता समूह (SHG) से जुड़ी हैं?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'yes', label: 'हाँ, मैं समूह सदस्य हूँ' },
                    { id: 'want_to_join', label: 'नहीं, पर जुड़ना चाहती हूँ' },
                    { id: 'no', label: 'नहीं' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setShgMember(opt.id)}
                      className={`p-3 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        shgMember === opt.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-emerald-300 bg-white text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Livelihood Interest */}
              <div>
                <label className="block text-sm sm:text-base font-bold text-emerald-950 mb-2.5">
                  3. आप अपनी आमदनी के लिए क्या काम करना चाहती हैं?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'sewing', label: '🧵 सिलाई, कढ़ाई व कपड़े का काम' },
                    { id: 'dairy', label: '🐄 गाय-भैंस, दूध डेयरी व पशुपालन' },
                    { id: 'shop', label: '🏪 गांव में छोटी परचून/ब्यूटी पार्लर दुकान' },
                    { id: 'food', label: '🥫 पापड़, अचार, मसाला व खाद्य उत्पाद' },
                    { id: 'drone', label: '🌾 ड्रोन उड़ाना व आधुनिक कृषि सखी' },
                    { id: 'family', label: '👧 बेटी की पढ़ाई या घर खर्च बचत' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setWorkPreference(opt.id)}
                      className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        workPreference === opt.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-emerald-300 bg-white text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Results View */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    बधाई हो दीदी! 🎉
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">
                    आपके लिए {matchedSchemes.length} प्रमुख योजनाएं उपयुक्त हैं:
                  </h3>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>दोबारा जांचें</span>
                </button>
              </div>

              <div className="space-y-3">
                {matchedSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    onClick={() => {
                      onClose();
                      onSelectScheme(scheme);
                    }}
                    className="p-4 rounded-2xl bg-white border-2 border-emerald-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 uppercase">
                        {scheme.categoryLabel.hi}
                      </span>
                      <h4 className="text-base font-bold text-emerald-950 group-hover:text-emerald-800">
                        {scheme.name.hi}
                      </h4>
                      <div className="text-xs font-bold text-emerald-900 mt-1">
                        👉 {scheme.highlightBenefit}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-emerald-700 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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

          {!matchedSchemes ? (
            <button
              onClick={handleCheck}
              disabled={!workPreference}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all"
            >
              योजनाएं देखें (Find My Schemes) →
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer"
            >
              हो गया (Done)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
