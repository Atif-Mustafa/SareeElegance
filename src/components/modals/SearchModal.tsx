import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Search, X, Sparkles, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products, formatPrice } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const recentSearches = ['Banarasi Katan', 'Tissue Silk', 'Kanjivaram Bridal', 'Ready to Wear', 'Pink Organza'];

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.fabric.toLowerCase().includes(term) ||
        p.occasion.toLowerCase().includes(term) ||
        p.zariType.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }, [searchTerm, products]);

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#2C221E]/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="bg-[#FAF7F2] rounded-2xl border border-[#C28E46]/40 shadow-2xl max-w-2xl w-full overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-6 border-b border-[#E6DFC6] flex items-center gap-3 bg-white">
            <Search className="w-5 h-5 text-[#C28E46] shrink-0" />
            <input
              type="text"
              id="search-overlay-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Banarasi, Kanjivaram, Tissue Silk, Bridal, Green Zari..."
              autoFocus
              className="w-full text-base sm:text-lg font-serif text-[#2C221E] bg-transparent focus:outline-none placeholder:text-stone-400 placeholder:font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-stone-400 hover:text-[#2C221E] text-xs px-2 py-1 bg-stone-100 rounded"
              >
                Clear
              </button>
            )}
            <button
              id="close-search-modal-btn"
              onClick={() => setIsSearchOpen(false)}
              className="p-1.5 rounded-full text-stone-500 hover:text-[#2C221E] hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Quick Suggestions / Recent Searches */}
            {!searchTerm && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7262] mb-3 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#C28E46]" /> Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        id={`search-tag-${term.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => setSearchTerm(term)}
                        className="text-xs bg-white text-[#2C221E] border border-[#E6DFC6] hover:border-[#C28E46] hover:text-[#C28E46] px-3 py-1.5 rounded-full transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7262] mb-3 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Featured Collections
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate('/collections/banarasi');
                      }}
                      className="p-3 bg-white rounded-xl border border-[#E6DFC6] hover:border-[#C28E46] text-left group transition-all"
                    >
                      <span className="font-serif font-bold text-sm text-[#2C221E] block group-hover:text-[#C28E46]">
                        Banarasi Silk Sarees
                      </span>
                      <span className="text-[11px] text-stone-500">Kadwa Weave & Real Gold Zari</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate('/collections/tissue-silk');
                      }}
                      className="p-3 bg-white rounded-xl border border-[#E6DFC6] hover:border-[#C28E46] text-left group transition-all"
                    >
                      <span className="font-serif font-bold text-sm text-[#2C221E] block group-hover:text-[#C28E46]">
                        Tissue Silk Collection
                      </span>
                      <span className="text-[11px] text-stone-500">Shimmering Metallic Sheen</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {searchTerm && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-500 border-b border-[#E6DFC6] pb-2">
                  <span>Found {searchResults.length} matching sarees</span>
                  <span>Searching for "{searchTerm}"</span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="font-serif text-lg font-semibold text-[#2C221E]">No matching sarees found</p>
                    <p className="text-xs text-stone-500">Try searching for "Banarasi", "Kanjivaram", "Tissue", or "Bridal"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate(`/product/${p.slug}`);
                        }}
                        className="flex items-center gap-4 p-3 bg-white hover:bg-[#F3EFE6] rounded-xl border border-[#E6DFC6] hover:border-[#C28E46] cursor-pointer transition-all group"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-16 h-20 object-cover rounded-lg shrink-0 border border-stone-200"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-[#C28E46] tracking-wider block">
                            {p.fabric}
                          </span>
                          <h4 className="font-serif text-base font-bold text-[#2C221E] truncate group-hover:text-[#C28E46] transition-colors">
                            {p.title}
                          </h4>
                          <p className="text-xs text-stone-500 truncate">{p.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-sm text-[#2C221E] block">
                            {formatPrice(p.priceINR)}
                          </span>
                          {p.compareAtPriceINR && (
                            <span className="text-[11px] text-stone-400 line-through">
                              {formatPrice(p.compareAtPriceINR)}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#C28E46] group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
