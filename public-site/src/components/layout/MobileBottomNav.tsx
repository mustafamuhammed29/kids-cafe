import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, Calendar, Tag, MessageSquare } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenBooking: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenBooking }) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-safe"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {/* 1. Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              isActive ? 'text-[#0EA5E9] font-extrabold' : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        {/* 2. Angebote */}
        <NavLink
          to="/services"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              isActive ? 'text-[#0EA5E9] font-extrabold' : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Angebote</span>
        </NavLink>

        {/* 3. Center Elevated Booking FAB */}
        <button
          type="button"
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center py-1 transition-transform cursor-pointer group min-h-[44px]"
          aria-label="Besuch reservieren"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center shadow-lg shadow-sky-500/30 -mt-5 group-hover:scale-105 active:scale-95 transition-all border-2 border-white">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-[#0EA5E9] tracking-tight mt-0.5">
            Buchen
          </span>
        </button>

        {/* 4. Preise */}
        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              isActive ? 'text-[#0EA5E9] font-extrabold' : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <Tag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Preise</span>
        </NavLink>

        {/* 5. Kontakt */}
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              isActive ? 'text-[#0EA5E9] font-extrabold' : 'text-gray-500 hover:text-gray-900 font-medium'
            }`
          }
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Kontakt</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
