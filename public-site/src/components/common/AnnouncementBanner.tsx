import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Flame, X, ArrowRight } from 'lucide-react';
import { getActiveAnnouncement, sanitizeSafeUrl, type SiteAnnouncement } from '../../services/contentService';

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<SiteAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getActiveAnnouncement().then((data) => {
      if (data && data.isActive) {
        setAnnouncement(data);
      }
    });
  }, []);

  if (!announcement || dismissed) return null;

  const typeConfig = {
    urgent: {
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dotBg: 'bg-rose-500',
      label: 'Aktion / Wichtig',
      icon: Flame,
      pillStyle: 'bg-gradient-to-r from-slate-950/95 via-rose-950/80 to-slate-950/95 border-rose-500/30 text-rose-100 shadow-[0_4px_25px_rgba(244,63,94,0.25)]',
      btnStyle: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50',
    },
    warning: {
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dotBg: 'bg-amber-400',
      label: 'Hinweis',
      icon: AlertTriangle,
      pillStyle: 'bg-gradient-to-r from-slate-950/95 via-amber-950/80 to-slate-950/95 border-amber-500/30 text-amber-100 shadow-[0_4px_25px_rgba(245,158,11,0.2)]',
      btnStyle: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-amber-900/50',
    },
    success: {
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dotBg: 'bg-emerald-400',
      label: 'Neuigkeit',
      icon: CheckCircle2,
      pillStyle: 'bg-gradient-to-r from-slate-950/95 via-emerald-950/80 to-slate-950/95 border-emerald-500/30 text-emerald-100 shadow-[0_4px_25px_rgba(16,185,129,0.2)]',
      btnStyle: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/50',
    },
    info: {
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      dotBg: 'bg-sky-400',
      label: 'Haven News',
      icon: Sparkles,
      pillStyle: 'bg-gradient-to-r from-slate-950/95 via-sky-950/70 to-slate-950/95 border-sky-500/30 text-slate-100 shadow-[0_4px_25px_rgba(14,165,233,0.2)]',
      btnStyle: 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-950',
    },
  }[announcement.type || 'info'];

  const IconComp = typeConfig.icon;
  const safeUrl = sanitizeSafeUrl(announcement.linkUrl);
  const isExternal = safeUrl ? safeUrl.startsWith('http://') || safeUrl.startsWith('https://') : false;

  return (
    <div
      role="banner"
      aria-label="Website-Ankündigung"
      className="w-full px-3 sm:px-4 pt-2.5 pb-1 flex justify-center pointer-events-auto"
    >
      {/* High-end circular / rounded capsule pill banner with marquee moving text */}
      <div
        className={`relative max-w-4xl w-full rounded-full border backdrop-blur-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center justify-between gap-2.5 sm:gap-3 transition-all duration-300 select-none ${typeConfig.pillStyle}`}
      >
        {/* Left Glowing Badge with Pulsing Live Dot */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider border shadow-xs ${typeConfig.badgeBg}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${typeConfig.dotBg}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${typeConfig.dotBg}`} />
            </span>
            <IconComp className="w-3 h-3 shrink-0" />
            <span className="hidden xs:inline">{typeConfig.label}</span>
          </span>
        </div>

        {/* Center: Smooth Marquee Moving Text (الكتابة تمشي) */}
        <div className="flex-1 overflow-hidden relative marquee-mask min-w-0 flex items-center">
          <div className="animate-marquee py-0.5 flex items-center gap-8 sm:gap-12 text-xs sm:text-sm font-semibold tracking-wide">
            {/* Duplicated for seamless infinite marquee loop */}
            <span className="flex items-center gap-3 shrink-0">
              <span>{announcement.message}</span>
              <span className="opacity-40 text-xs">✦</span>
            </span>
            <span className="flex items-center gap-3 shrink-0">
              <span>{announcement.message}</span>
              <span className="opacity-40 text-xs">✦</span>
            </span>
            <span className="flex items-center gap-3 shrink-0">
              <span>{announcement.message}</span>
              <span className="opacity-40 text-xs">✦</span>
            </span>
            <span className="flex items-center gap-3 shrink-0">
              <span>{announcement.message}</span>
              <span className="opacity-40 text-xs">✦</span>
            </span>
          </div>
        </div>

        {/* Right CTA Chip & Close Button */}
        <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
          {safeUrl && (
            <a
              href={safeUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full transition-transform active:scale-95 shadow-md ${typeConfig.btnStyle}`}
            >
              <span>{announcement.linkText || 'Details'}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Hinweis schließen"
            title="Schließen"
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer shrink-0 border border-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
