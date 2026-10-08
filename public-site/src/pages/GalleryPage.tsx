import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { X, ZoomIn, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { getGalleryItems, type GalleryItem } from '../services/contentService';
import { usePageSeo } from '../hooks/usePageSeo';

const DEFAULT_GALLERY_IMAGES: GalleryItem[] = [
  {
    id: 1,
    url: '/assets/spielbereich.jpg',
    title: 'Pädagogischer Spielbereich',
    category: 'Spielbereich',
    desc: 'Hochwertiges Holzspielzeug, sichere Klettermodule und Motorikstationen.',
  },
  {
    id: 2,
    url: '/assets/artisan-cafe.jpg',
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
    url: '/assets/hero-interior.jpg',
    title: 'Helle Wohlfühl-Atmosphäre',
    category: 'Café',
    desc: 'Offenes Raumkonzept mit uneingeschränkter Sicht auf den Spielbereich.',
  },
  {
    id: 5,
    url: '/assets/geburtstage.jpg',
    title: 'Geburtstags-Festtisch',
    category: 'Events',
    desc: 'Festlich dekorierter Tisch mit bunten Details und Kindergeschirr.',
  },
  {
    id: 6,
    url: '/assets/salt-sanctuary.jpg',
    title: 'Salzraum-Ruheoase',
    category: 'Salzraum',
    desc: 'Entspannendes Mikroklima mit feinem Trockensalz und kinderfreundlichen Spielzeugen.',
  },
];

export const GalleryPage: React.FC = () => {
  usePageSeo({
    title: 'Galerie & Raumeindrücke | Haven Kids Café Berlin',
    description: 'Entdecke die Bildergalerie: Pädagogischer Spielbereich, modernes Eltern-Café, sanfter Salzraum und fröhliche Eventdekoration.',
    canonicalPath: '/gallery',
  });

  const [images, setImages] = useState<GalleryItem[]>(DEFAULT_GALLERY_IMAGES);
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    getGalleryItems().then((items) => {
      if (items && items.length > 0) setImages(items);
    });
  }, []);

  useEffect(() => {
    if (!activeImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveImage(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImage]);

  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');
  const categories = [
    'Alle',
    ...Array.from(new Set(images.map((img) => img.category).filter(Boolean))),
  ];

  const filteredImages = images.filter(
    (img) => selectedCategory === 'Alle' || img.category === selectedCategory
  );

  return (
    <div className="pt-16 sm:pt-20 md:pt-24 animate-fadeIn pb-24 md:pb-20 bg-[#FAF8F5] min-h-screen text-dark">
      {/* Header - Confident, Generous & Welcoming */}
      <section className="relative pt-6 pb-6 sm:py-12 px-4 text-center bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-sky-50 border border-sky-100 text-primary font-bold text-xs sm:text-sm mb-3 shadow-xs">
            <ImageIcon className="w-4 h-4" />
            <span>Visuelle Raumeindrücke</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-3">
            Einblicke &amp; Atmosphäre
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-xl mx-auto leading-relaxed">
            Helle Räume, pädagogisch ausgewähltes Holzspielzeug und ein einladender Salzraum für die ganze Familie.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Category Filter */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 pt-1 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shrink-0 cursor-pointer min-h-[44px] ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 min-[540px]:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveImage(img)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all group cursor-pointer flex flex-col hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={img.url}
                  alt={img.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith('/assets/spielbereich.jpg')) {
                      target.src = '/assets/spielbereich.jpg';
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                
                {/* Category Pill Tag */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-800 px-3 py-1 rounded-lg shadow-xs">
                    {img.category}
                  </span>
                </div>

                {/* Subtle Hover/Tap Indicator */}
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-md">
                    <ZoomIn className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-base sm:text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {img.title}
                  </h2>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                    {img.desc}
                  </p>
                </div>
                <span className="text-xs sm:text-sm font-bold text-primary mt-3 flex items-center gap-1.5">
                  <span>Vollbild ansehen</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <div className="mt-14 sm:mt-20 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs text-center max-w-4xl mx-auto">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary bg-primary/10 py-1.5 px-3.5 rounded-lg inline-block mb-3">
            Vorbeikommen &amp; Erleben
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Erlebe Haven Kids live vor Ort
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Sichere dir eure gemeinsame Auszeit: 2 Stunden pädagogischer Spielspaß, zwei kostenlose Begleitpersonen und frischer Barista-Kaffee.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/pricing"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-base transition flex items-center justify-center gap-2 cursor-pointer min-h-[50px]"
            >
              <span>Preise &amp; Tarife ansehen</span>
              <ArrowRight className="w-4 h-4 text-secondary" />
            </Link>
            <Link
              to="/contact"
              className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-base transition flex items-center justify-center cursor-pointer min-h-[50px]"
            >
              <span>Anfahrt &amp; Kontakt</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox Modal rendered via Portal directly to body */}
      {activeImage && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeImage.title}
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
          onClick={() => setActiveImage(null)}
        >
          {/* Close button with safe area support */}
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            aria-label="Schließen"
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-[110] w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition cursor-pointer min-h-[44px] min-w-[44px] shadow-lg border border-white/10 pt-[env(safe-area-inset-top,0px)]"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Centered Modal Card */}
          <div
            className="relative max-w-4xl w-full max-h-[90dvh] bg-slate-900 text-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 overflow-hidden min-h-0">
              <img
                src={activeImage.url}
                alt={activeImage.title}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('/assets/spielbereich.jpg')) {
                    target.src = '/assets/spielbereich.jpg';
                  }
                }}
                className="max-h-[85dvh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="p-4 sm:p-5 bg-slate-900 text-left border-t border-white/10">
              <span className="text-[10px] sm:text-xs font-bold text-sky-400 uppercase tracking-wider block mb-0.5">
                {activeImage.category}
              </span>
              <h2 className="font-extrabold text-base sm:text-lg text-white mb-1">
                {activeImage.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {activeImage.desc}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GalleryPage;
