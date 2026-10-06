import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, MessageCircle } from 'lucide-react';
import { FAQS, BUSINESS_INFO } from '../../data/mockData';

export const FaqSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const categories = ['Alle', 'Besuch & Regeln', 'Salzraum', 'Preise & Buchung', 'Sicherheit & Hygiene'];

  const filteredFaqs = FAQS.filter((faq) => {
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
    <section id="faq" className="py-24 bg-[#FAFAFA] scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-[#93B1A6]/15 py-1 px-3.5 rounded-full inline-block mb-3">
            Transparenz & Antworten
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#183D3D] mb-4">
            Häufig gestellte Fragen
          </h2>
          <div className="w-20 h-1 bg-[#5C8374] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-base">
            Alles Wichtige rund um deinen Besuch, Hygiene, Altersgrenzen und den Salzraum auf einen Blick.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-gray-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nach Themen suchen (z. B. Socken, Parken, Salzraum, Bezahlung)..."
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-gray-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5C8374] focus:border-[#5C8374] shadow-xs transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#183D3D] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition"
                  >
                    <span className="font-bold text-sm sm:text-base text-[#183D3D] flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-[#5C8374] shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#5C8374]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 animate-fadeIn">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-500 text-sm">
              Keine passenden Fragen gefunden. Schreibe uns gerne direkt bei WhatsApp!
            </div>
          )}
        </div>

        {/* WhatsApp Help Banner */}
        <div className="mt-12 bg-[#93B1A6]/15 rounded-3xl p-6 sm:p-8 text-center border border-[#93B1A6]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-bold text-base text-[#183D3D]">Noch eine offene Frage?</h4>
            <p className="text-xs sm:text-sm text-gray-600">Unser Team hilft dir gerne persönlich weiter.</p>
          </div>
          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5C8374] hover:bg-[#183D3D] text-white px-5 py-2.5 rounded-full text-xs font-bold transition shadow-sm whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Jetzt auf WhatsApp chatten</span>
          </a>
        </div>
      </div>
    </section>
  );
};
