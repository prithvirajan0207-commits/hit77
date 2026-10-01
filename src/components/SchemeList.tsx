import React, { useState } from 'react';
import {
  Coins,
  Scissors,
  Flame,
  Milk,
  Store,
  Baby,
  PlaneTakeoff,
  HeartHandshake,
  ShieldPlus,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  ChevronRight,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { SCHEMES_DATA, CATEGORIES, Scheme } from '../data/schemes';
import { LanguageOption } from '../data/languages';
import { speakText, stopSpeaking } from '../utils/speech';

interface SchemeListProps {
  currentLanguage: LanguageOption;
  onSelectScheme: (scheme: Scheme) => void;
  onAskAboutScheme: (schemeName: string, initialQuestion?: string) => void;
}

export const SchemeList: React.FC<SchemeListProps> = ({
  currentLanguage,
  onSelectScheme,
  onAskAboutScheme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingSchemeId, setPlayingSchemeId] = useState<string | null>(null);

  const filteredSchemes = SCHEMES_DATA.filter((scheme) => {
    const matchesCategory =
      selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesSearch =
      scheme.name.hi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.highlightBenefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.shortTagline.hi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleCardAudio = (e: React.MouseEvent, scheme: Scheme) => {
    e.stopPropagation();
    if (playingSchemeId === scheme.id) {
      stopSpeaking();
      setPlayingSchemeId(null);
    } else {
      stopSpeaking();
      setPlayingSchemeId(scheme.id);
      speakText(scheme.sampleAudioText, currentLanguage.speechCode, () => {
        setPlayingSchemeId(null);
      });
    }
  };

  // Helper to render icon
  const renderSchemeIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 sm:w-7 sm:h-7 stroke-[2]' };
    switch (iconName) {
      case 'Coins':
        return <Coins {...props} />;
      case 'Scissors':
        return <Scissors {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'HeartHandshake':
        return <HeartHandshake {...props} />;
      case 'Store':
        return <Store {...props} />;
      case 'Milk':
        return <Milk {...props} />;
      case 'ShieldPlus':
        return <ShieldPlus {...props} />;
      case 'Baby':
        return <Baby {...props} />;
      case 'PlaneTakeoff':
        return <PlaneTakeoff {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <span>🌿 ग्रामीण महिला कल्याण</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-serif tracking-tight">
            प्रमुख सरकारी योजनाएं व स्वरोजगार
          </h2>
          <p className="text-sm sm:text-base text-emerald-800 font-medium mt-1">
            बिना किसी दलाल या बिचौलिए के—सीधे सरकारी लाभ और सहायता पाएं
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="योजना खोजें (सिलाई, लोन, गैस...)"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-emerald-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Category Pills (Large, Touchable, Friendly) */}
      <div className="flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar mb-6">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20 ring-2 ring-emerald-600'
                  : 'bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs'
              }`}
            >
              <span>{cat.label.hi}</span>
            </button>
          );
        })}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((scheme) => {
          const isPlayingThis = playingSchemeId === scheme.id;

          return (
            <div
              key={scheme.id}
              onClick={() => onSelectScheme(scheme)}
              className="bg-white rounded-3xl border-2 border-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer group text-left relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-500"></div>

              <div>
                {/* Header Row: Category Badge + Audio Speaker Icon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    {scheme.categoryLabel.hi}
                  </span>

                  {/* DIRECT AUDIO SPEAKER BUTTON ON CARD */}
                  <button
                    onClick={(e) => handleToggleCardAudio(e, scheme)}
                    title="बोलकर सुनें (Listen aloud)"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isPlayingThis
                        ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-300'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {isPlayingThis ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                        <span>रुकें</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>सुनें</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Scheme Icon & Title */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700/10 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {renderSchemeIcon(scheme.iconName)}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-emerald-950 font-serif leading-snug group-hover:text-emerald-800 transition-colors">
                      {scheme.name.hi}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                      {scheme.name.en}
                    </p>
                  </div>
                </div>

                {/* Highlight Benefit Box */}
                <div className="my-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                    मुख्य फायदा:
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5 line-clamp-2">
                    {scheme.highlightBenefit}
                  </div>
                </div>

                {/* Brief description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
                  {scheme.shortTagline.hi}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-emerald-100 flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskAboutScheme(scheme.name.hi, `मुझे ${scheme.name.hi} के बारे में बताएं।`);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                >
                  <span>सखी से पूछें</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-900 group-hover:translate-x-1 transition-transform">
                  <span>पूरी जानकारी</span>
                  <ChevronRight className="w-4 h-4 text-emerald-700" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-emerald-200 p-6">
          <p className="text-base font-semibold text-emerald-900">
            दीदी, इस नाम से कोई योजना नहीं मिली।
          </p>
          <p className="text-xs text-slate-500 mt-1">
            कृपया माइक दबाकर अपनी आवश्यकता बताएं (जैसे: सिलाई, लोन, दुकान)।
          </p>
        </div>
      )}
    </section>
  );
};
