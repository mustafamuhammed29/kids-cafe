import React from 'react';
import { FaqSection } from '../components/home/FaqSection';
import { HelpCircle } from 'lucide-react';
import { usePageSeo } from '../hooks/usePageSeo';

export const FaqPage: React.FC = () => {
  usePageSeo({
    title: 'Häufige Fragen (FAQ) | Haven Kids Café Berlin',
    description: 'Wichtige Antworten: Altersgrenzen (0-8 Jahre), Sockenpflicht, Salzraum-Ablauf, Stornierungsfristen und barrierefreier Zugang.',
    canonicalPath: '/faq',
  });

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 animate-fadeIn pb-24 md:pb-20 bg-[#FAF8F5] min-h-screen text-dark">
      {/* Header - Confident, Generous & Welcoming */}
      <section className="relative pt-6 pb-6 sm:py-12 px-4 text-center bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-sky-50 border border-sky-100 text-primary font-bold text-xs sm:text-sm mb-3 shadow-xs">
            <HelpCircle className="w-4 h-4" />
            <span>Transparenz &amp; Antworten</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-3">
            Häufige Fragen (FAQ)
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Schnelle Antworten zu Sockenpflicht, Altersgrenzen (0–8 J.), Buchung &amp; Salzraum.
          </p>
        </div>
      </section>

      {/* Main Interactive FAQ Section with Search directly above-the-fold */}
      <FaqSection hideHeader={true} className="bg-[#FAF8F5]" />
    </div>
  );
};

export default FaqPage;
