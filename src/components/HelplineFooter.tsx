import React from 'react';
import { Phone, ShieldCheck, HeartHandshake } from 'lucide-react';

export const HelplineFooter: React.FC = () => {
  const HELPLINES = [
    { number: '181', label: 'महिला सुरक्षा व सहायता (Women Helpline)' },
    { number: '14449', label: 'उज्ज्वला गैस हेल्पलाइन (LPG Assistance)' },
    { number: '1800-180-1551', label: 'किसान कॉल सेंटर व डेयरी' },
    { number: '14555', label: 'आयुष्मान भारत अस्पताल सहायता' },
    { number: '1098', label: 'बालिका व शिशु सुरक्षा (Childline)' },
  ];

  return (
    <footer className="bg-emerald-950 text-white mt-12 border-t-4 border-emerald-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Helplines Call-out Bar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-emerald-900/60 border border-emerald-700/60 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold font-serif text-emerald-100">
              जरूरी सरकारी टोल-फ्री हेल्पलाइन नंबर (सीधा मुफ्त कॉल करें)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HELPLINES.map((item, idx) => (
              <a
                key={idx}
                href={`tel:${item.number}`}
                className="p-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-700/50 flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="text-[11px] text-emerald-300 font-medium">
                    {item.label}
                  </div>
                  <div className="text-lg font-extrabold text-white tracking-wide">
                    {item.number}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-700 group-hover:bg-emerald-600 text-xs font-bold text-white transition-colors">
                  कॉल
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Informative Note & Disclaimer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-emerald-300/80 border-t border-emerald-900 pt-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <span>
              सखी सहेली — ग्रामीण भारतीय महिलाओं के सशक्तिकरण और स्वावलंबन के लिए समर्पित डिजिटल साथी।
            </span>
          </div>
          <div className="text-emerald-400/90 font-medium">
            सभी योजनाएं आधिकारिक भारत सरकार के पोर्टलों द्वारा प्रमाणित हैं।
          </div>
        </div>
      </div>
    </footer>
  );
};
