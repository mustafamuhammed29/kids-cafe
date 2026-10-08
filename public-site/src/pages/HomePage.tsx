import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail, 
  Check, 
  Smile, 
  Footprints, 
  ShieldCheck,
  Calendar,
  Clock,
  Blocks,
  Wind,
  Coffee,
  CheckCircle2,
  Star,
  Sparkles,
  Award,
} from 'lucide-react';

import { usePageSeo } from '../hooks/usePageSeo';
import { BUSINESS_INFO } from '../data/mockData';

interface HomePageProps {
  onOpenBooking: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenBooking }) => {
  usePageSeo({
    title: 'Haven Kids Café | Spielcafé & Salzraum in Berlin',
    description: 'Sicherer Spielbereich für Kinder 0-8 Jahre. Entspannung für Eltern mit Barista-Kaffee & sanftem Salzraum in Berlin. Jetzt Termin buchen!',
    canonicalPath: '/',
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Scroll reveal observer
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Three.js interactive 3D background (Salt crystals & playful shapes)
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    let animationFrameId: number;
    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Camera positioned with slight right offset so 3D animation focuses on the right side
    camera.position.set(isMobile ? 0 : 2.5, isMobile ? -4 : 0, isMobile ? 22 : 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const colors = [0x0ea5e9, 0xfb7185, 0xfbbf24, 0x38bdf8];
    const geometries = [
      new THREE.SphereGeometry(1.2, 24, 24),
      new THREE.IcosahedronGeometry(1.4, 0),
      new THREE.TorusGeometry(0.9, 0.35, 16, 24),
      new THREE.OctahedronGeometry(1.1, 0),
    ];

    const toys: {
      mesh: THREE.Mesh;
      rx: number;
      ry: number;
      floatSpeed: number;
      initialY: number;
    }[] = [];

    const objectCount = isMobile ? 8 : 20;

    for (let i = 0; i < objectCount; i++) {
      const material = new THREE.MeshPhysicalMaterial({
        color: colors[i % colors.length],
        roughness: 0.15,
        metalness: 0.1,
        transmission: 0.75,
        thickness: 0.5,
        transparent: true,
        opacity: isMobile ? 0.45 : 0.85,
        clearcoat: 0.8,
      });

      const mesh = new THREE.Mesh(geometries[i % geometries.length], material);

      if (isMobile) {
        mesh.position.x = (Math.random() - 0.5) * 8;
        mesh.position.y = Math.random() * 5 + 3.5;
        mesh.position.z = (Math.random() - 0.5) * 4 - 2;
      } else {
        // Animation strictly placed on the RIGHT side
        mesh.position.x = Math.random() * 6.5 + 3.8;
        mesh.position.y = (Math.random() - 0.5) * 11;
        mesh.position.z = (Math.random() - 0.5) * 6 - 1;
      }

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      scene.add(mesh);

      toys.push({
        mesh,
        rx: (Math.random() - 0.5) * 0.015,
        ry: (Math.random() - 0.5) * 0.015,
        floatSpeed: Math.random() * 0.02 + 0.01,
        initialY: mesh.position.y,
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;
      mouseX = (event.clientX - windowHalfX) * 0.002;
      mouseY = (event.clientY - windowHalfY) * 0.002;
    };

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      const currentlyMobile = window.innerWidth < 768;
      camera.position.set(currentlyMobile ? 0 : 2.5, currentlyMobile ? -4 : 0, currentlyMobile ? 22 : 15);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      targetX = mouseX * 2;
      targetY = mouseY * 2;

      camera.position.x += ((isMobile ? 0 : 2.5) + targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(isMobile ? 0 : 2.5, 0, 0);

      toys.forEach((toy) => {
        toy.mesh.rotation.x += toy.rx;
        toy.mesh.rotation.y += toy.ry;
        toy.mesh.position.y =
          toy.initialY + Math.sin(elapsedTime * toy.floatSpeed * 60) * 0.8;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      geometries.forEach((g) => g.dispose());
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="bg-[#FAF8F5] text-dark antialiased selection:bg-primary selection:text-white overflow-x-hidden">
      
      {/* =========================================================================
          1. HERO SECTION - TWO-COLUMN WITH RIGHT-SIDE 3D ANIMATION
          ========================================================================= */}
      <section className="relative min-h-[90vh] sm:min-h-[92vh] flex items-center overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 bg-gradient-to-b from-sky-50/50 via-[#FAF8F5]/80 to-[#FAF8F5]">
        {/* 3D Canvas Container */}
        <div 
          ref={canvasRef} 
          id="canvas-container" 
          className="absolute inset-0 w-full h-full z-0 pointer-events-none md:pointer-events-auto opacity-70 md:opacity-100" 
        />

        {/* Soft background mask to guarantee text readability */}
        <div className="absolute inset-0 bg-white/40 md:bg-transparent z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full flex flex-col md:flex-row items-center justify-between">
          {/* Left Column: Headline, Description & CTAs */}
          <div className="w-full md:w-[60%] lg:w-[56%] text-left md:pr-8">
            {/* Google Rating Trust Badge */}
            <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-white/90 backdrop-blur-xs text-slate-800 font-semibold text-xs sm:text-sm mb-5 shadow-xs border border-slate-200/80">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <span className="font-bold text-slate-900">4.9 / 5</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 font-medium hidden sm:inline">150+ glückliche Familien in Berlin</span>
              <span className="text-slate-600 font-medium sm:hidden">Berlin</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.08]">
              Spielen für sie, <br />
              <span className="bg-gradient-to-r from-sky-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                Durchatmen für dich.
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-base sm:text-xl lg:text-2xl text-slate-600 mb-8 sm:mb-10 font-normal max-w-2xl leading-relaxed">
              Ein sicherer, bildschirmfreier Spielbereich für Kinder (0–8 Jahre), kombiniert mit wohltuendem Salzraum und echtem Barista-Kaffeegenuss für Eltern.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-md sm:max-w-none mb-10">
              <button 
                type="button"
                onClick={onOpenBooking} 
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-base sm:text-lg text-center transition-all shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 flex items-center justify-center gap-2.5 cursor-pointer min-h-[52px] active:scale-[0.98]"
              >
                <span>Platz reservieren</span>
                <ArrowRight className="w-5 h-5 text-sky-100" />
              </button>
              <Link 
                to="/services" 
                className="w-full sm:w-auto bg-white/90 hover:bg-slate-50 text-slate-800 px-7 py-4 rounded-2xl font-bold text-base sm:text-lg text-center transition-all shadow-xs border border-slate-200/80 cursor-pointer min-h-[52px] flex items-center justify-center hover:border-slate-300"
              >
                Angebote entdecken
              </Link>
            </div>

            {/* Quick Assurance Strip */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              <span className="inline-flex items-center gap-2 bg-white/95 px-3.5 py-2 rounded-xl border border-slate-200/70 shadow-xs">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>2 Begleitpersonen gratis</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/95 px-3.5 py-2 rounded-xl border border-slate-200/70 shadow-xs">
                <Check className="w-4 h-4 text-sky-600" />
                <span>Kostenfrei stornierbar</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/95 px-3.5 py-2 rounded-xl border border-slate-200/70 shadow-xs">
                <Check className="w-4 h-4 text-amber-600" />
                <span>0–8 Jahre pädagogisch</span>
              </span>
            </div>
          </div>

          {/* Right Column Dedicated Space for 3D Animation */}
          <div className="hidden md:block md:w-[40%] lg:w-[44%] min-h-[460px] pointer-events-none" />
        </div>
      </section>

      {/* =========================================================================
          2. CORE VALUES / THREE RULES
          ========================================================================= */}
      <section id="rules" className="py-16 sm:py-24 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-xs sm:text-sm font-bold text-sky-600 uppercase tracking-widest block mb-2">
              Harmonisch &amp; Sicher
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Wichtige Infos vor deinem Besuch
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2">
              Alles Wissenswerte für einen entspannten und reibungslosen Aufenthalt bei uns.
            </p>
          </div>

          <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-px-4 px-4 sm:px-0 -mx-4 sm:mx-0 hide-scrollbar pb-3">
            {/* Rule 1 */}
            <div className="snap-start shrink-0 w-[84vw] sm:w-auto bg-gradient-to-br from-sky-50/50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-sky-100 flex items-start gap-4 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Footprints className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5">Sockenpflicht</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Gilt für alle Kinder und Erwachsene im Spiel- und Salzraum. Stoppersocken empfohlen.
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="snap-start shrink-0 w-[84vw] sm:w-auto bg-gradient-to-br from-rose-50/50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-rose-100 flex items-start gap-4 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5">Aufsichtspflicht</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Kein Betreuungsdienst. Die Aufsicht verbleibt während des gesamten Aufenthalts bei den Eltern.
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="snap-start shrink-0 w-[84vw] sm:w-auto bg-gradient-to-br from-amber-50/50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-amber-100 flex items-start gap-4 shadow-xs hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1.5">Altersgerecht 0–8 J.</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sicherer, reizarmer Raum, speziell auf Kleinkinder und Entdecker bis maximal 8 Jahre abgestimmt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. OUR SPACES / BENTO GRID LUXURY SHOWCASE
          ========================================================================= */}
      <section id="services" className="py-16 sm:py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold text-sky-600 uppercase tracking-widest block mb-2">
              Unser Raumkonzept
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Drei Welten unter einem Dach
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
              Kindliche Freude ohne Reizüberflutung kombiniert mit echter Entspannung für Eltern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* World 1: Spielbereich */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
              <div>
                <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Blocks className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-100/70 px-3 py-1 rounded-md mb-3 inline-block">
                  0–8 Jahre
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2.5">
                  Pädagogischer Spielbereich
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                  100% bildschirmfreie Zone mit langlebigem Holzspielzeug, sicheren Klettermodulen und geschütztem Krabbelbereich.
                </p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700 font-medium border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Sichere Motorik-Stationen</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Tägliche Desinfektion &amp; Hygiene</span>
                </li>
              </ul>
            </div>

            {/* World 2: Salzraum */}
            <div className="bg-gradient-to-br from-amber-50/50 via-white to-sky-50/40 rounded-3xl p-7 sm:p-8 border-2 border-sky-400 shadow-md flex flex-col justify-between relative hover:shadow-xl transition-all duration-300 group">
              <div className="absolute top-5 right-5">
                <span className="text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-sky-500 to-blue-600 px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Highlight
                </span>
              </div>
              <div>
                <div className="w-14 h-14 bg-amber-100/80 text-amber-600 rounded-2xl flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Wind className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-3 py-1 rounded-md mb-3 inline-block">
                  45 Min. • Max. 8 Kids
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2.5">
                  Sanfter Salzraum
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                  Feinstes Trockensalz-Mikroklima in heller, kinderfreundlicher Atmosphäre zum spielerischen Entspannen und tiefen Durchatmen.
                </p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700 font-medium border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Trockenes Salzaerosol</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Kinderfreundliche Schaufel-Spielzeuge</span>
                </li>
              </ul>
            </div>

            {/* World 3: Café */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-300 group">
              <div>
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                  <Coffee className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-100/70 px-3 py-1 rounded-md mb-3 inline-block">
                  Für Eltern
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2.5">
                  Eltern-Café &amp; Lounge
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                  Barista Specialty Coffee, feine Bio-Tees und gesunde Kindersnacks mit freiem Blick auf den gesamten Spielbereich.
                </p>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-700 font-medium border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Hafermilch &amp; Bio-Snacks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Kostenloses Highspeed-WLAN</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SALZRAUM SPOTLIGHT BANNER
          ========================================================================= */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50/40 to-sky-50 border border-amber-200/70 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                <Wind className="w-3.5 h-3.5" /> Reines Salzklima für die ganze Familie
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Sanfte Erholung im Salzraum: <br />
                <span className="text-sky-600">Spielen wie am Meeresstrand.</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Während die Kleinen mit Schaufeln und Förmchen im echten Mineralsalz spielen, genießen Eltern wohltuende Ruhe und ein sanftes, reizarmes Raumklima. Ideal in der Erkältungszeit oder nach einem anstrengenden Kitatag.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-700 font-semibold pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sanfte 45-Minuten-Sessions
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sanfte Lichttherapie
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Barrierefreier Einstieg
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Salzraum-Session buchen</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </button>
              <span className="text-xs text-slate-500">Kombinierbar mit Spielbereich-Eintritt</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. GALLERY STRIP CAROUSEL
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-stone-200/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div>
              <span className="text-xs sm:text-sm font-bold text-sky-600 uppercase tracking-widest block mb-1">
                Eindrücke &amp; Räume
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Einblicke in unsere Wohlfühl-Oase
              </h2>
            </div>
            <Link
              to="/gallery"
              className="text-sm sm:text-base font-bold text-sky-600 hover:underline flex items-center gap-1.5 shrink-0"
            >
              <span>Alle Bilder ansehen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-px-4 px-4 sm:px-0 gap-4 sm:gap-6 hide-scrollbar py-2 -mx-4 sm:mx-0">
            {/* Slide 1: Spielbereich */}
            <div className="snap-start shrink-0 w-[80vw] sm:w-[320px] bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col group hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[4/3] max-h-[250px] overflow-hidden bg-slate-100">
                <img
                  src="/assets/spielbereich.jpg"
                  alt="Pädagogischer Spielbereich im Haven Kids Café Berlin"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 text-xs font-bold uppercase bg-white/95 backdrop-blur-md text-slate-800 px-2.5 py-1 rounded-md shadow-xs">
                  Spielbereich
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1">
                  Pädagogischer Spielbereich
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                  100% bildschirmfrei mit langlebigem Holzspielzeug.
                </p>
              </div>
            </div>

            {/* Slide 2: Salzraum */}
            <div className="snap-start shrink-0 w-[80vw] sm:w-[320px] bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col group hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[4/3] max-h-[250px] overflow-hidden bg-slate-100">
                <img
                  src="/assets/salt-sanctuary.jpg"
                  alt="Sanfter Salzraum im Haven Kids Café Berlin"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 text-xs font-bold uppercase bg-gradient-to-r from-sky-500 to-blue-600 text-white px-2.5 py-1 rounded-md shadow-xs">
                  Salzraum
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1">
                  Sanfter Salzraum
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                  Wohltuendes Trockensalz-Mikroklima für Kids.
                </p>
              </div>
            </div>

            {/* Slide 3: Café */}
            <div className="snap-start shrink-0 w-[80vw] sm:w-[320px] bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col group hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[4/3] max-h-[250px] overflow-hidden bg-slate-100">
                <img
                  src="/assets/artisan-cafe.jpg"
                  alt="Eltern-Café mit Barista Kaffee im Haven Kids Café Berlin"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 text-xs font-bold uppercase bg-white/95 backdrop-blur-md text-amber-900 px-2.5 py-1 rounded-md shadow-xs">
                  Café &amp; Lounge
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1">
                  Barista Café &amp; Lounge
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                  Specialty Coffee mit freier Sicht auf den Spielbereich.
                </p>
              </div>
            </div>

            {/* Slide 4: Feiern */}
            <div className="snap-start shrink-0 w-[80vw] sm:w-[320px] bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col group hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[4/3] max-h-[250px] overflow-hidden bg-slate-100">
                <img
                  src="/assets/geburtstage.jpg"
                  alt="Kindergeburtstage und Feiern im Haven Kids Café Berlin"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 text-xs font-bold uppercase bg-rose-500 text-white px-2.5 py-1 rounded-md shadow-xs">
                  Feiern &amp; Events
                </span>
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 mb-1">
                  Kindergeburtstage &amp; Feste
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">
                  Rundum-sorglos feiern mit Deko, Snacks und Spielzeit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. PRICING PREVIEW
          ========================================================================= */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold text-sky-600 uppercase tracking-widest block mb-2">
              Eintritt &amp; Tarife
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Faire Familienpreise
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
              Zwei Begleitpersonen pro Kind sind bei uns immer kostenfrei inklusive!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-8">
            {/* Einzelbesuch */}
            <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-100/70 px-3 py-1 rounded-md mb-3 inline-block">
                  Spontan
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Einzelbesuch</h3>
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">14 €</span>
                  <span className="text-sm sm:text-base text-slate-500 ml-1.5">/ 2 Stunden</span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
                  Voller Zugang zu allen Spielbereichen. 2 Erwachsene frei.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 transition cursor-pointer min-h-[48px] shadow-2xs hover:shadow-xs"
              >
                Ticket buchen
              </button>
            </div>

            {/* 10er-Block */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-500 shadow-md flex flex-col justify-between relative hover:shadow-xl transition-all duration-300">
              <div className="absolute -top-3.5 left-6">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black text-xs uppercase px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Bestseller • Spart 20 €
                </span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-100/70 px-3 py-1 rounded-md mb-3 inline-block pt-1">
                  Top Sparer
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">10er-Block Pass</h3>
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">120 €</span>
                  <span className="text-sm sm:text-base text-sky-600 font-bold ml-1.5">(12 € / Besuch)</span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
                  10 Eintritte à 2h. Auf Geschwister übertragbar + 1x Gratis-Salzraum inklusive.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white transition cursor-pointer min-h-[48px] shadow-sm hover:shadow-md"
              >
                Pass sichern
              </button>
            </div>

            {/* Geburtstag */}
            <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-3 py-1 rounded-md mb-3 inline-block">
                  Event
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Kindergeburtstag</h3>
                <div className="mb-4">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">ab 250 €</span>
                  <span className="text-sm sm:text-base text-slate-500 ml-1.5">/ 2,5 Stunden</span>
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed">
                  Inkl. 8 Kinder &amp; 4 Erw., Tischdeko, Bio-Snacks &amp; Getränke.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 transition cursor-pointer min-h-[48px] shadow-2xs hover:shadow-xs"
              >
                Termin anfragen
              </button>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-sky-600 hover:underline py-2.5 px-4"
            >
              <span>Alle Details und Vergleichstabelle ansehen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. PARENT TESTIMONIALS (WAS BERLINER FAMILIEN SAGEN)
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-xs sm:text-sm font-bold text-sky-600 uppercase tracking-widest block mb-2">
              Echtes Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Was Berliner Familien sagen
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2">
              Erfahrungen von Mamas und Papas, die regelmäßig im Haven Kids Café entspannen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Review 1 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic mb-6">
                  „Endlich ein Spielcafé in Berlin, wo die Kleinen sicher und ohne laute Plastikgeräusche spielen können. Und der Cappuccino für uns Eltern ist auf Barista-Niveau!“
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm">
                  SM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sarah M.</h4>
                  <span className="text-xs text-slate-500">Mama von Leo (3 J.)</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic mb-6">
                  „Der Salzraum ist genial. Die Kids buddeln im Salz wie am Strand und atmen dabei tief durch. Wir haben nach dem ersten Besuch direkt den 10er-Block genommen.“
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                  DK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Dennis K.</h4>
                  <span className="text-xs text-slate-500">Papa von Mia (4 J.) &amp; Noah (1 J.)</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic mb-6">
                  „Wir haben hier den 4. Geburtstag gefeiert. Entspannteste Feier aller Zeiten! Das Team hat sich um alles gekümmert, die Kinder waren glücklich und das Café war blitzsauber.“
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-sm">
                  EA
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Elena &amp; Alex</h4>
                  <span className="text-xs text-slate-500">Geburtstagsfeier mit 10 Kids</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. DIRECT BOOKING PLANNER & CONTACT
          ========================================================================= */}
      <section id="info" className="py-16 sm:py-24 bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="text-left space-y-4">
              <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-sky-50 text-sky-600 text-xs sm:text-sm font-bold">
                <Calendar className="w-4 h-4" />
                <span>Einfache Online-Reservierung</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
                Bereit für euren Besuch?
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
                Reserviere deinen Wunschtermin online in unter 2 Minuten. Keine Vorauszahlung nötig – Bezahlung flexibel vor Ort!
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-stone-200/80 font-medium">
                  <MapPin className="w-4 h-4 text-sky-500" />
                  {BUSINESS_INFO.address.split(',')[0]}
                </span>
                <span className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-stone-200/80 font-medium">
                  <Clock className="w-4 h-4 text-sky-500" />
                  Mo–Sa geöffnet
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto shrink-0 flex flex-col gap-3.5">
              <button
                type="button"
                onClick={onOpenBooking}
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-4 px-9 rounded-2xl transition shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 text-base sm:text-lg flex items-center justify-center gap-2.5 cursor-pointer min-h-[52px] active:scale-[0.98]"
              >
                <span>Jetzt Wunschtermin sichern</span>
                <ArrowRight className="w-5 h-5 text-sky-100" />
              </button>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500 font-medium">
                <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="hover:text-sky-600 transition flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  Anrufen
                </a>
                <span>•</span>
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-sky-600 transition flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  E-Mail
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
