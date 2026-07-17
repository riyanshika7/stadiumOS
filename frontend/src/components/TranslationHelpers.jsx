import React from 'react';

export const SIMULATION_PHRASES = [
  { text: '¿Dónde puedo encontrar el ascensor más cercano para silla de ruedas?', label: '🇪🇸 Spanish: Elevator Query' },
  { text: "Où se trouve la billetterie s'il vous plaît?", label: "🇫🇷 French: Ticket Query" },
  { text: 'ห้องน้ำอยู่ที่ไหน', label: '🇹🇭 Thai: Restroom Query' },
  { text: 'トイレはどこですか', label: '🇯🇵 Japanese: Restroom Query' },
  { text: '洗手间在哪里', label: '🇨🇳 Mandarin: Restroom Query' },
  { text: 'أين المرحاض؟', label: '🇸🇦 Arabic: Restroom Query' },
  { text: 'Wo ist die Toilette?', label: '🇩🇪 German: Restroom Query' },
  { text: 'Onde fica o banheiro?', label: '🇧🇷 Portuguese: Restroom Query' },
  { text: "Dov'è il bagno?", label: "🇮🇹 Italian: Restroom Query" },
  { text: 'Me siento muy mal, tengo dolor de pecho y me falta el aire.', label: '🚨 Spanish: Panic Medical' }
];

export default function TranslationHelpers({ onSimulate }) {
  return (
    <div className="speech-helpers" role="group" aria-label="Language phrase simulators">
      {SIMULATION_PHRASES.map((phrase, idx) => (
        <button key={idx} type="button" className="speech-tag" onClick={() => onSimulate(phrase.text)}>
          {phrase.label}
        </button>
      ))}
    </div>
  );
}
