import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, HelpCircle, MessageCircle, X } from 'lucide-react';
import { FAQS, BUSINESS_INFO } from '../../data/mockData';
import { getFaqItems, type FaqItem } from '../../services/contentService';

interface FaqSectionProps {
  hideHeader?: boolean;
  className?: string;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ hideHeader = false, className = '' }) => {
  const [faqs, setFaqs] = useState<FaqItem[]>(FAQS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  useEffect(() => {
    getFaqItems().then((items) => {
      if (items && items.length > 0) setFaqs(items);
    });
  }, []);

  const categories = ['Alle', 'Besuch & Regeln', 'Salzraum', 'Preise & Buchung', 'Sicherheit & Hygiene'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'Alle' || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq" className={`${hideHeader ? 'pt-4 sm:pt-8 pb-12 sm:pb-20' : 'py-12 sm:py-20'} scroll-mt-24 ${className || 'bg-slate-50/50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        {!hideHeader && (
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary bg-primary/10 py-1.5 px-3.5 rounded-lg inline-block mb-3">
              Transparenz &amp; Antworten
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
              Häufig gestellte Fragen
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
              Alles Wichtige rund um deinen Besuch, Altersgrenzen, Sockenpflicht und den Salzraum.
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Thema suchen (z. B. Socken, Parken, Baby, Storno)..."
            className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white rounded-2xl border border-slate-200 text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary shadow-xs transition text-slate-900"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer min-h-[42px] ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3 sm:space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition min-h-[56px]"
                  >
                    <span className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-2 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30 animate-fadeIn">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              Keine passenden Fragen gefunden. Schreibe uns gerne direkt bei WhatsApp!
            </div>
          )}
        </div>

        {/* WhatsApp Quick Help Banner */}
        <div className="mt-10 sm:mt-14 bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-left">
            <h4 className="font-bold text-lg sm:text-xl text-slate-900">Noch eine Frage offen?</h4>
            <p className="text-sm text-slate-500 mt-1">Unser Team berät dich gerne direkt persönlich.</p>
          </div>
          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-2xl text-sm sm:text-base font-bold transition shadow-xs min-h-[48px]"
          >
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span>Auf WhatsApp chatten</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
