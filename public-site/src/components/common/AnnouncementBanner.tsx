import React, { useEffect, useState } from 'react';
import { Info, AlertTriangle, CheckCircle2, AlertOctagon, X, ArrowRight } from 'lucide-react';
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

  const bgStyles = {
    info: 'bg-[#0F172A] text-white border-b border-gray-800',
    warning: 'bg-amber-500 text-dark font-medium border-b border-amber-600',
    success: 'bg-emerald-600 text-white border-b border-emerald-700',
    urgent: 'bg-rose-600 text-white font-bold border-b border-rose-700',
  }[announcement.type || 'info'];

  const IconComponent = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle2,
    urgent: AlertOctagon,
  }[announcement.type || 'info'];

  return (
    <div
      role="banner"
      className={`relative py-3 px-4 text-sm font-medium transition-all z-40 ${bgStyles}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 justify-center sm:justify-start">
          <IconComponent className="w-4 h-4 shrink-0" />
          <span>{announcement.message}</span>
          {(() => {
            const safeUrl = sanitizeSafeUrl(announcement.linkUrl);
            if (!safeUrl) return null;
            const isExternal = safeUrl.startsWith('http://') || safeUrl.startsWith('https://');
            return (
              <a
                href={safeUrl}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 ml-2"
              >
                <span>{announcement.linkText || 'Mehr erfahren'}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            );
          })()}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Hinweis schließen"
          className="p-1 rounded-md hover:bg-black/10 transition cursor-pointer shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
