import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { LANGUAGES, LanguageCode } from '../../lib/i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full' | 'footer';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const { language, setLanguage } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'footer') {
    return (
      <div ref={dropdownRef} className={`relative space-y-1.5 ${className}`}>
        <label className="text-xs font-serif text-stone-300 font-bold block flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#C28E46]" /> Language / भाषा
        </label>
        
        <button
          id="footer-language-dropdown-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-[#1A1412] hover:bg-[#2C221E] border border-stone-700 hover:border-[#C28E46] text-stone-200 transition-all shadow-md group"
          title="Select Language"
        >
          <span className="flex items-center gap-2">
            <span className="text-sm">{currentLang.flag}</span>
            <span className="font-bold text-white">{currentLang.nativeName}</span>
            <span className="text-stone-400 text-[10px]">({currentLang.name})</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-[#C28E46] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-full bg-[#2C221E] rounded-2xl border border-[#C28E46] shadow-2xl py-2 z-50 text-xs animate-fadeIn">
            <div className="px-3 py-1.5 border-b border-stone-800 font-serif font-bold text-[#D4AF37] flex items-center justify-between">
              <span>Select Language</span>
              <span className="text-[10px] text-stone-400 font-mono">10 Languages</span>
            </div>

            <div className="max-h-56 overflow-y-auto py-1 divide-y divide-stone-800/60">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#C28E46]/20 text-[#D4AF37] font-bold border-l-4 border-[#C28E46]'
                        : 'text-stone-300 hover:bg-stone-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <div>
                        <div className="font-semibold">{lang.nativeName}</div>
                        <div className="text-[10px] text-stone-400">{lang.name}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#D4AF37]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        id="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F3EFE6] border border-[#E6DFC6] text-[#2C221E] transition-all shadow-xs"
        title="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#C28E46] shrink-0" />
        <span className="flex items-center gap-1">
          <span>{currentLang.flag}</span>
          <span>{currentLang.nativeName}</span>
        </span>
        <ChevronDown className={`w-3 h-3 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border-2 border-[#C28E46] shadow-2xl py-2 z-50 text-xs animate-fadeIn">
          <div className="px-3 py-1.5 border-b border-[#F3EFE6] font-serif font-bold text-[#2C221E] flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-[10px] text-[#C28E46] font-mono">10 Languages</span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-[#FAF7F2]">
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#FAF7F2] text-[#2C221E] font-bold border-l-4 border-[#C28E46]'
                      : 'text-stone-700 hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <div>
                      <div className="font-semibold">{lang.nativeName}</div>
                      <div className="text-[10px] text-stone-400">{lang.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#C28E46]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
