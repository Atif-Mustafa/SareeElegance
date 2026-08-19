import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { SILK_GLOSSARY_TERMS } from '@/features/glossary/components/SilkGlossaryModal';
import { BookOpen, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';

interface GlossaryTermProps {
  term: string;
  children?: React.ReactNode;
}

export const GlossaryTerm: React.FC<GlossaryTermProps> = ({ term, children }) => {
  const { openGlossaryModal } = useStore();
  const [isHovered, setIsHovered] = useState(false);

  // Match term with SILK_GLOSSARY_TERMS
  const matchedTerm = SILK_GLOSSARY_TERMS.find(
    (t) =>
      t.term.toLowerCase() === term.toLowerCase() ||
      t.id.toLowerCase() === term.toLowerCase() ||
      t.term.toLowerCase().includes(term.toLowerCase())
  );

  const displayLabel = children || term;

  return (
    <span
      className="relative inline-block font-medium cursor-pointer group text-[#2C221E]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        openGlossaryModal(matchedTerm?.term || term);
      }}
    >
      <span className="underline decoration-dotted decoration-[#C28E46] decoration-2 underline-offset-4 group-hover:text-[#C28E46] group-hover:bg-[#C28E46]/10 px-1 py-0.5 rounded transition-all inline-flex items-center gap-0.5">
        <span>{displayLabel}</span>
        <BookOpen className="w-3 h-3 text-[#C28E46] inline-block opacity-70 group-hover:opacity-100" />
      </span>

      {/* Hover Card Popover */}
      {isHovered && matchedTerm && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#2C221E] text-white text-xs rounded-2xl border-2 border-[#C28E46] shadow-2xl z-40 pointer-events-none animate-fadeIn block text-left">
          <span className="flex items-center justify-between border-b border-[#C28E46]/40 pb-1.5 mb-1.5">
            <span className="font-serif font-bold text-[#D4AF37] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" /> {matchedTerm.term}
            </span>
            <span className="text-[9px] bg-[#C28E46]/20 text-[#D4AF37] border border-[#C28E46]/40 px-1.5 py-0.2 rounded font-sans">
              {matchedTerm.category}
            </span>
          </span>

          <span className="text-[11px] text-stone-200 block line-clamp-3 leading-tight mb-2">
            {matchedTerm.shortDef}
          </span>

          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center justify-between border-t border-white/10 pt-1.5">
            <span>Click to view in Silk Glossary</span>
            <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
          </span>
        </span>
      )}
    </span>
  );
};

interface InteractiveDescriptionProps {
  text: string;
  className?: string;
  showGlossaryButton?: boolean;
}

export const InteractiveDescription: React.FC<InteractiveDescriptionProps> = ({
  text,
  className = '',
  showGlossaryButton = true
}) => {
  const { openGlossaryModal } = useStore();

  // Known glossary keywords to highlight automatically in product descriptions
  const glossaryKeywords = [
    'Meenakari',
    'Jacquard',
    'Kadwa',
    'Korvai',
    'Katan',
    'Tanchoi',
    'Tissue Silk',
    'Tissue',
    'Zari',
    'Pallu',
    'Silk Mark',
    'Fall & Pico'
  ];

  // Regex pattern matching any of the keywords
  const regex = new RegExp(`\\b(${glossaryKeywords.join('|')})\\b`, 'gi');

  const parts = text.split(regex);

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="leading-relaxed">
        {parts.map((part, index) => {
          const matched = glossaryKeywords.find((kw) => kw.toLowerCase() === part.toLowerCase());
          if (matched) {
            return <GlossaryTerm key={index} term={matched} />;
          }
          return part;
        })}
      </p>

      {showGlossaryButton && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => openGlossaryModal()}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#C28E46] hover:text-[#2C221E] bg-[#C28E46]/10 hover:bg-[#C28E46]/20 border border-[#C28E46]/30 px-2.5 py-1 rounded-lg transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C28E46]" />
            <span>Explore Full Silk & Weaving Glossary</span>
          </button>
        </div>
      )}
    </div>
  );
};
