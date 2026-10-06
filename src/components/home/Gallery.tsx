import React from 'react';
import { Camera } from 'lucide-react';

export const Gallery: React.FC = () => {
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1545042746-860f38b46bc3?auto=format&fit=crop&w=800&q=80',
      title: 'Pädagogischer Spielbereich',
      desc: 'Holzspielzeuge & Klettermodule',
      span: 'md:col-span-2 md:row-span-2',
      height: 'h-80 md:h-full',
    },
    {
      url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      title: 'Eltern-Café',
      desc: 'Specialty Coffee & gesunde Bio-Snacks',
      span: 'col-span-1',
      height: 'h-64',
    },
    {
      url: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=800&q=80',
      title: 'Kreatives Entdecken',
      desc: 'Sicher für Krabbelkinder & Minis',
      span: 'col-span-1',
      height: 'h-64',
    },
    {
      url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      title: 'Helle Wohlfühl-Atmosphäre',
      desc: 'Offenes Raumkonzept mit Weitblick',
      span: 'md:col-span-2',
      height: 'h-64',
    },
  ];

  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-[#93B1A6]/15 py-1 px-3 rounded-full inline-block mb-3">
            Einblicke in unsere Oase
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#183D3D] mb-4">
            Eindrücke aus dem Haven Kids Café
          </h2>
          <div className="w-20 h-1 bg-[#5C8374] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Ein Raum zum Wohlfühlen, Toben und Entspannen. Liebevoll gestaltet bis ins kleinste Detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
          {images.map((img, i) => (
            <div
              key={i}
              className={`rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative group ${img.span} ${img.height}`}
            >
              <img
                src={img.url}
                alt={img.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#183D3D]/80 via-[#183D3D]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform group-hover:-translate-y-1 transition-transform">
                <span className="text-[11px] font-semibold text-[#FFD3B6] flex items-center gap-1.5 mb-1">
                  <Camera className="w-3.5 h-3.5" />
                  Haven Kids Einblick
                </span>
                <h4 className="font-bold text-lg sm:text-xl text-white drop-shadow-xs">{img.title}</h4>
                <p className="text-xs text-gray-200 mt-0.5 font-light">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
