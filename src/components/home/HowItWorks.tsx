import React from 'react';
import { CalendarDays, Users, CheckCircle, Smile } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Termin & Zeitslot wählen',
      description: 'Wähle deinen Wunschtag und einen unserer drei festen 2-Stunden-Slots (10:00, 12:30 oder 15:00 Uhr) mit garantierten Kapazitäten.',
      icon: CalendarDays,
    },
    {
      step: '02',
      title: 'Kinder & Extras angeben',
      description: 'Gib die Anzahl und das Alter deiner Kinder (0–8 Jahre) an. Wähle optional eine 45-Minuten-Salzraumsitzung hinzu.',
      icon: Users,
    },
    {
      step: '03',
      title: 'Sofortbestätigung erhalten',
      description: 'Du erhältst direkt deine persönliche Buchungsreferenz, eine automatische E-Mail und kannst den Termin in deinen Kalender laden.',
      icon: CheckCircle,
    },
    {
      step: '04',
      title: 'Vor Ort zahlen & genießen',
      description: 'Bezahlen kannst du stressfrei beim Check-in vor Ort (Bar, EC/Kreditkarte oder PayPal). Stoppersocken an und los geht’s!',
      icon: Smile,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C8374] bg-[#93B1A6]/15 py-1 px-3 rounded-full inline-block mb-3">
            In 4 einfachen Schritten
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#183D3D] mb-4">
            So funktioniert dein Besuch bei uns
          </h2>
          <div className="w-20 h-1 bg-[#FFD3B6] mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Kein Stress, keine langen Wartezeiten an der Kasse. Unsere Vorab-Reservierung garantiert euch jederzeit ausreichend Platz und saubere Spielbereiche.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-[#FAFAFA] rounded-3xl p-7 border border-gray-100 flex flex-col relative group hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#93B1A6]/20 text-[#5C8374] flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-3xl text-gray-200 select-none">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-[#183D3D] mb-2">{s.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
