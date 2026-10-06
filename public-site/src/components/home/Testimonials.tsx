import React from 'react';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../data/mockData';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-[#93B1A6]/15 py-1 px-3 rounded-full inline-block mb-3">
            Echte Erfahrungen
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#183D3D] mb-4">
            Was Eltern über Haven Kids sagen
          </h2>
          <div className="w-20 h-1 bg-[#FFD3B6] mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-base sm:text-lg">
            Das schönste Kompliment für unser Team: Glückliche Kinder und erholte Eltern.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-[#FAFAFA] rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative group hover:bg-white"
            >
              <Quote className="w-10 h-10 text-[#93B1A6]/30 absolute top-6 right-6" />

              {/* Star Rating */}
              <div className="flex gap-1 mb-5 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="mt-auto pt-4 border-t border-gray-200/60">
                <span className="font-bold text-sm text-[#183D3D] block">{t.author}</span>
                <span className="text-xs text-gray-500">{t.city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
