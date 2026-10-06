import type { ServiceItem, TimeSlot, AddonItem } from '../types/booking';

export const BUSINESS_INFO = {
  name: 'Haven Kids Café',
  tagline: 'Premium Spielcafé & Salzraum für Familien',
  address: 'Friedrichstraße 123, 10117 Berlin, Deutschland',
  phone: '+49 30 1234 5678',
  phoneClean: '+493012345678',
  email: 'hello@havenkids.de',
  whatsappUrl: 'https://wa.me/493012345678?text=Hallo%20Haven%20Kids%20Team%2C%20ich%20habe%20eine%20Frage%20zu%20meinem%20Besuch.',
  ageRange: '0 – 8 Jahre',
  maxSlotCapacity: 20,
  maxSaltRoomCapacity: 8,
  medicalDisclaimer: 'Das mikroklimatische Salzraum-Erlebnis bietet eine beruhigende Atmosphäre und wohltuendes Raumklima. Unser Angebot dient der Entspannung und ersetzt keine medizinische Therapie oder Behandlung.',
  hours: [
    { days: 'Montag – Donnerstag', time: '10:00 – 18:00 Uhr' },
    { days: 'Freitag – Samstag', time: '09:00 – 19:00 Uhr' },
    { days: 'Sonntag', time: 'Ruhetag (Exklusiv-Events buchbar)' },
  ],
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'service-single',
    slug: 'einzelbesuch',
    name: 'Einzelbesuch Spielbereich',
    tagline: '2 Stunden freies Entdecken & Spielen',
    category: 'single',
    durationMinutes: 120,
    basePrice: 14.0,
    priceLabel: '14 € / 2 Stunden',
    description: 'Zugang zum gesamten pädagogischen Holzspielbereich, Motorikparcours und zur Babyecke. 2 Begleitpersonen pro Kind sind kostenfrei inklusive.',
    includesAdults: 2,
    maxChildren: 6,
    popular: false,
    features: [
      'Voller Zugang zum pädagogischen Spielbereich',
      '2 Begleitpersonen (Erwachsene) pro Kind kostenfrei',
      'Bildschirmfreie Entdecker-Zonen (0–8 Jahre)',
      'Gemütliche Café-Sitzplätze mit direktem Sichtkontakt',
      'Salzraum für 5 € pro Kind optional zubuchbar',
    ],
  },
  {
    id: 'service-pass',
    slug: '10er-block',
    name: '10er-Block Pass',
    tagline: 'Unser Familien-Bestseller – Spare 20 €',
    category: 'single',
    durationMinutes: 120,
    basePrice: 120.0,
    priceLabel: '120 € / 10 Besuche',
    description: '10 Einzeleintritte à 2 Stunden. 12 Monate gültig, uneingeschränkt auf Geschwisterkinder übertragbar. Inklusive 1x Salzraum-Gutschein.',
    includesAdults: 2,
    maxChildren: 10,
    badge: 'Bestseller',
    popular: true,
    features: [
      '10 Eintritte à 2 Stunden (Ersparnis von 20 €)',
      '12 Monate volle Gültigkeit ab Kaufdatum',
      'Übertragbar auf Geschwisterkinder',
      'Inklusive 1x kostenloser Salzraum-Besuch (45 Min)',
      'Priorisierte Reservierung bei Ferienzeiten',
    ],
  },
  {
    id: 'service-birthday',
    slug: 'kindergeburtstag',
    name: 'Kindergeburtstag Premium',
    tagline: 'Das rundum sorglose Geburtstagsfest',
    category: 'birthday',
    durationMinutes: 150,
    basePrice: 250.0,
    priceLabel: 'ab 250 €',
    description: 'Exklusiver Festtisch, liebevolle Deko, Kids-Snacks & Getränke für bis zu 8 Kinder und 4 Erwachsene. Stressfrei für Eltern, unvergesslich für Kids.',
    includesAdults: 4,
    maxChildren: 12,
    badge: 'All-Inclusive',
    popular: false,
    features: [
      'Bis zu 8 Kinder & 4 Erwachsene inklusive',
      'Liebevoll festlich dekorierter Geburtstagstisch',
      'Bio-Snacks, Saftschorlen & Kids-Meal enthalten',
      '2,5 Stunden Spiel- und Feierzeit',
      'Salzraum-Session optional für die Gruppe zubuchbar',
    ],
  },
];

export const ADDONS: AddonItem[] = [
  {
    id: 'addon-salt-room',
    name: 'Salzraum-Erlebnis (45 Min)',
    pricePerUnit: 5.0,
    description: 'Wohltuendes, trockenes Salzaerosol-Mikroklima zur tiefen Entspannung in kindgerechter Atmosphäre.',
    maxPerBooking: 8,
  },
];

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  {
    id: 'slot-1',
    startTime: '10:00',
    endTime: '12:00',
    maxCapacity: 20,
    bookedCount: 6,
    cleaningBuffer: '30 Min Reinigung & Belüftung (12:00 - 12:30)',
  },
  {
    id: 'slot-2',
    startTime: '12:30',
    endTime: '14:30',
    maxCapacity: 20,
    bookedCount: 12,
    cleaningBuffer: '30 Min Reinigung & Belüftung (14:30 - 15:00)',
  },
  {
    id: 'slot-3',
    startTime: '15:00',
    endTime: '17:00',
    maxCapacity: 20,
    bookedCount: 4,
    cleaningBuffer: 'Schließzeit & Grunddesinfektion',
  },
];

export const TESTIMONIALS = [
  {
    id: 't-1',
    author: 'Sarah M. (Mama von Leo, 3 Jahre)',
    city: 'Berlin-Mitte',
    rating: 5,
    text: 'Haven Kids ist für uns die ultimative Rettung an Regentagen. Leo liebt die Holzspielsachen und den Kletterbereich, während ich in aller Ruhe einen herausragenden Flat White trinken und durchatmen kann!',
  },
  {
    id: 't-2',
    author: 'Daniel & Julia (Eltern von Maya, 1,5 Jahre)',
    city: 'Prenzlauer Berg',
    rating: 5,
    text: 'Der Salzraum ist wunderbar beruhigend gestaltet – hell, sauber und überhaupt nicht beklemmend wie traditionelle Salzgrotten. Maya hat dort friedlich gespielt und wir haben sofort den 10er-Block gekauft.',
  },
  {
    id: 't-3',
    author: 'Katrin W. (Mama von Felix, 5 Jahre)',
    city: 'Berlin-Kreuzberg',
    rating: 5,
    text: 'Wir haben den 5. Geburtstag von Felix hier gefeiert. Keine Vorbereitung, kein Chaos zu Hause, super gesunde Snacks und glückliche Kinder. Absolut jeden Cent wert!',
  },
];

export const FAQS = [
  {
    id: 'faq-1',
    category: 'Besuch & Regeln',
    question: 'Gilt bei euch eine Sockenpflicht?',
    answer: 'Ja, aus strengen Hygiene- und Sicherheitsgründen gilt im gesamten Spiel- und Salzbereich Sockenpflicht (am besten rutschfeste Stoppersocken) für alle Kinder UND erwachsenen Begleitpersonen. Falls ihr eure Socken vergessen habt, könnt ihr an der Kasse bequeme Anti-Rutsch-Socken erwerben.',
  },
  {
    id: 'faq-2',
    category: 'Besuch & Regeln',
    question: 'Welche Altersgruppe darf den Spielbereich nutzen?',
    answer: 'Unser Konzept und alle Spielmodule sind speziell auf Babys, Kleinkinder und Kinder von 0 bis maximal 8 Jahren ausgelegt. So stellen wir sicher, dass auch die kleinsten Entdecker in einem geschützten, altersgerechten Umfeld ohne Hektik spielen können.',
  },
  {
    id: 'faq-3',
    category: 'Besuch & Regeln',
    question: 'Bietet Haven Kids eine Kinderbetreuung an?',
    answer: 'Nein, wir sind ein Familien-Café und bieten keine Beaufsichtigung oder Kinderbetreuung an. Die gesetzliche Aufsichtspflicht verbleibt während des gesamten Besuchs lückenlos bei den Eltern bzw. den erwachsenen Begleitpersonen.',
  },
  {
    id: 'faq-4',
    category: 'Salzraum',
    question: 'Was ist das Besondere an eurem Salzraum?',
    answer: 'Unser Salzraum nutzt moderne, zertifizierte Trockensalzgeneratoren. Das Raumklima ist sanft temperiert, hell und kinderfreundlich mit hellem Spielzeug eingerichtet. Hinweis: Das mikroklimatische Salzraum-Erlebnis bietet eine beruhigende Atmosphäre und wohltuendes Raumklima. Unser Angebot dient der Entspannung und ersetzt keine medizinische Therapie oder Behandlung.',
  },
  {
    id: 'faq-5',
    category: 'Preise & Buchung',
    question: 'Kosten Begleitpersonen extra Eintritt?',
    answer: 'Nein! Pro gebuchtem Kind sind 2 erwachsene Begleitpersonen (z. B. Mama und Papa oder Großeltern) vollkommen kostenfrei im Eintritt enthalten.',
  },
  {
    id: 'faq-6',
    category: 'Preise & Buchung',
    question: 'Wie bezahle ich meine Buchung?',
    answer: 'Die Bezahlung erfolgt bequem und flexibel direkt vor Ort beim Check-in. Wir akzeptieren Barzahlung, EC-/Girocard, alle gängigen Kreditkarten (Visa/Mastercard) sowie kontaktlose Zahlung via Smartphone.',
  },
  {
    id: 'faq-7',
    category: 'Sicherheit & Hygiene',
    question: 'Was passiert, wenn mein Kind kurzfristig krank wird?',
    answer: 'Aus Rücksicht auf die Gesundheit aller kleinen Gäste bitten wir euch dringend, bei akuten Infekten (Fieber, Magen-Darm, starker Husten) zu Hause zu bleiben. Ihr könnt eure Reservierung über den Link in eurer Bestätigungs-E-Mail oder per kurzem WhatsApp-Klick kostenfrei und unkompliziert verschieben oder stornieren.',
  },
];
