import { MessageCircle } from 'lucide-react';
import { SITE_BRAND } from '../config/siteContent';
import { buildDirectWhatsAppUrl } from '../utils/contactHelpers';

export function FloatingWhatsApp() {
  return (
    <a
      href={buildDirectWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Conversar pelo WhatsApp com ${SITE_BRAND.name} no número ${SITE_BRAND.phoneDisplay}`}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2.5 px-4 py-3 min-h-[48px] rounded-full bg-[#E63946] hover:bg-[#C82835] text-white text-sm font-semibold shadow-lg transition-transform duration-150 hover:-translate-y-0.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
    >
      <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
