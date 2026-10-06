import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, Tag, HelpCircle, Phone } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenBooking: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenBooking }) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass-bottom-nav border-t border-gray-200/90 shadow-2xl pb-safe"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* 1. Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              isActive ? 'text-[#183D3D] font-extrabold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        {/* 2. Book Modal Trigger */}
        <button
          type="button"
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center py-1 text-[#5C8374] hover:text-[#183D3D] transition-colors min-h-[44px] cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-full bg-[#5C8374] text-white flex items-center justify-center shadow-md -mt-3 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-[#5C8374] tracking-tight mt-0.5">Buchen</span>
        </button>

        {/* 3. Pricing */}
        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              isActive ? 'text-[#183D3D] font-extrabold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Tag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Preise</span>
        </NavLink>

        {/* 4. FAQ */}
        <NavLink
          to="/faq"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              isActive ? 'text-[#183D3D] font-extrabold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <HelpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">FAQ</span>
        </NavLink>

        {/* 5. Contact */}
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              isActive ? 'text-[#183D3D] font-extrabold' : 'text-gray-500 hover:text-gray-900'
            }`
          }
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Kontakt</span>
        </NavLink>
      </div>
    </nav>
  );
};
