'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppFloatingButton() {
  const whatsappNumber = '51924462641';
  const whatsappMessage =
    'Hola Neko Manga Cix, quiero consultar por un manga';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-8 right-8 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Contactar por WhatsApp"
      title="Contactar por WhatsApp"
    >
      <MessageCircle size={28} fill="currentColor" />
    </a>
  );
}
