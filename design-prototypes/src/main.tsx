import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ConceptAHome } from '../concept-a-editorial/ConceptAHome';
import { ConceptBHome } from '../concept-b-boutique/ConceptBHome';
import { ConceptCHome } from '../concept-c-playful-premium/ConceptCHome';
import { AdminDashboardPreview } from '../admin-dashboard-preview/AdminDashboardPreview';
import { Eye, Layers, ShieldCheck, Compass } from 'lucide-react';

type PrototypeView = 'concept-a' | 'concept-b' | 'concept-c' | 'admin-preview';

const App: React.FC = () => {
  const getInitialView = (): PrototypeView => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'concept-b') return 'concept-b';
    if (hash === 'concept-c') return 'concept-c';
    if (hash === 'admin-preview') return 'admin-preview';
    return 'concept-a';
  };

  const [currentView, setCurrentView] = useState<PrototypeView>(getInitialView);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setView = (view: PrototypeView) => {
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="relative">
      {/* Prototype Switcher Banner */}
      <div className="sticky top-0 z-50 bg-[#1D2623] text-[#FAF7F2] px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-black/30">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#E8927C]" />
          <span className="font-bold tracking-wide uppercase text-[11px] text-[#D4E4E7]">
            Haven Design Reset · Prototypen
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setView('concept-a')}
            className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer text-xs whitespace-nowrap ${
              currentView === 'concept-a'
                ? 'bg-[#FAF7F2] text-[#243E36] font-bold shadow-xs'
                : 'text-[#FAF7F2]/80 hover:bg-white/10'
            }`}
          >
            A: Editorial Calm
          </button>

          <button
            type="button"
            onClick={() => setView('concept-b')}
            className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer text-xs whitespace-nowrap ${
              currentView === 'concept-b'
                ? 'bg-[#FAF7F2] text-[#243E36] font-bold shadow-xs'
                : 'text-[#FAF7F2]/80 hover:bg-white/10'
            }`}
          >
            B: Boutique Wellness
          </button>

          <button
            type="button"
            onClick={() => setView('concept-c')}
            className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer text-xs whitespace-nowrap ${
              currentView === 'concept-c'
                ? 'bg-[#FAF7F2] text-[#243E36] font-bold shadow-xs'
                : 'text-[#FAF7F2]/80 hover:bg-white/10'
            }`}
          >
            C: Playful Premium
          </button>

          <span className="h-4 w-px bg-white/20 mx-1"></span>

          <button
            type="button"
            onClick={() => setView('admin-preview')}
            className={`px-3 py-1.5 rounded-full font-medium transition cursor-pointer text-xs whitespace-nowrap ${
              currentView === 'admin-preview'
                ? 'bg-[#E8927C] text-[#1D2623] font-bold shadow-xs'
                : 'text-[#FAF7F2]/80 hover:bg-white/10'
            }`}
          >
            Admin Dashboard
          </button>
        </div>
      </div>

      {/* Render Active Concept Prototype */}
      <div>
        {currentView === 'concept-a' && <ConceptAHome />}
        {currentView === 'concept-b' && <ConceptBHome />}
        {currentView === 'concept-c' && <ConceptCHome />}
        {currentView === 'admin-preview' && <AdminDashboardPreview />}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
