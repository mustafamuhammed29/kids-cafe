import React from 'react';
import { AlertCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../../data/mockData';

interface MedicalDisclaimerProps {
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ className = '' }) => {
  return (
    <div
      role="note"
      className={`rounded-2xl border border-sky-200 bg-sky-50/80 p-4 md:p-5 text-sky-900 shadow-xs flex items-start gap-3.5 ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-xs md:text-sm leading-relaxed">
        <span className="font-semibold block mb-0.5 text-sky-950">Wichtiger Hinweis zum Salzraum:</span>
        <p className="text-sky-800">{BUSINESS_INFO.medicalDisclaimer}</p>
      </div>
    </div>
  );
};
