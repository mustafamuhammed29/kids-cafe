import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  category: string;
  desc: string;
}

export const GalleryPage: React.FC = () => {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  const images: GalleryImage[] = [
    {
      id: 1,
      url: '/assets/gallery-1.jpg',
      title: 'Pädagogischer Spielbereich',
      category: 'Spielbereich',
      desc: 'Hochwertiges Holzspielzeug, sichere Klettermodule und Motorikstationen.',
    },
    {
      id: 2,
      url: '/assets/gallery-2.jpg',
      title: 'Eltern-Café & Specialty Coffee',
      category: 'Café',
      desc: 'Frisch zubereitete Kaffeespezialitäten, Bio-Tees und gesunde Kindersnacks.',
    },
    {
      id: 3,
      url: '/assets/gallery-3.jpg',
      title: 'Kreatives Entdecken',
      category: 'Spielbereich',
      desc: 'Liebevoll eingerichtete Spielinseln für fantasievolles und freies Spielen.',
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
      title: 'Helle Wohlfühl-Atmosphäre',
      category: 'Café',
      desc: 'Offenes Raumkonzept mit uneingeschränkter Sicht auf den Spielbereich.',
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1000&q=80',
      title: 'Geburtstags-Festtisch',
      category: 'Events',
      desc: 'Festlich dekorierter Tisch mit bunten Details und Kindergeschirr.',
    },
    {
      id: 6,
      url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1000&q=80',
      title: 'Salzraum-Ruheoase',
      category: 'Salzraum',
      desc: 'Entspannendes Mikroklima mit feinem Trockensalz und kinderfreundlichen Spielzeugen.',
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const categories = ['Alle', 'Spielbereich', 'Salzraum', 'Café', 'Events'];

  const filteredImages = images.filter(
    (img) => selectedCategory === 'Alle' || img.category === selectedCategory
  );

  return (
    <div className="pt-20 sm:pt-24 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-[#183D3D] text-white py-12 sm:py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFD3B6] bg-white/10 py-1 px-3.5 rounded-full inline-block mb-3">
            Visuelle Eindrücke
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Fotogalerie
          </h1>
          <p className="text-sm sm:text-base text-gray-200 max-w-xl mx-auto font-light leading-relaxed">
            Ein virtueller Rundgang durch das Haven Kids Café: Helle Räume, pädagogisches Holzspielzeug und pure Wohlfühlatmosphäre.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer min-h-[40px] ${
                selectedCategory === cat
                  ? 'bg-[#183D3D] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveImage(img)}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer relative flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-[#183D3D] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#183D3D] px-2.5 py-1 rounded-full shadow-xs">
                    {img.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#183D3D] mb-1 group-hover:text-[#5C8374] transition-colors">
                    {img.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {img.desc}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#5C8374] mt-3 block">
                  Vergrößern →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              aria-label="Schließen"
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[65vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={activeImage.url}
                alt={activeImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 bg-white">
              <span className="text-xs font-bold text-[#5C8374] uppercase tracking-wider block mb-1">
                {activeImage.category}
              </span>
              <h3 className="font-extrabold text-xl text-[#183D3D] mb-2">
                {activeImage.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {activeImage.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
