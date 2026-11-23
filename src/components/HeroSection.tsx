import { ArrowDownRight, Check, MessageCircle } from 'lucide-react';
import { HERO_CONTENT, SITE_BRAND } from '../config/siteContent';
import { buildDirectWhatsAppUrl } from '../utils/contactHelpers';
import { ThreeCleaningScene } from './ThreeCleaningScene';

export function HeroSection() {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById('contato');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="topo"
      className="bg-[#F5F5F5] border-b border-zinc-200/80 py-10 sm:py-14 lg:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: Core Proposition */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#C82835] mb-3">
              {HERO_CONTENT.eyebrow}
            </p>

            <h1 className="font-display text-[clamp(2.25rem,4vw,3.45rem)] font-extrabold leading-[1.08] tracking-tight text-zinc-900 [text-wrap:balance]">
              {HERO_CONTENT.headline}
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-zinc-600 max-w-xl">
              {HERO_CONTENT.subtitle}
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-zinc-700">
              {HERO_CONTENT.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#E63946] shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#contato"
                onClick={scrollToContact}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] text-sm sm:text-base font-semibold text-white bg-[#E63946] hover:bg-[#C82835] rounded-xl transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
              >
                <span>{HERO_CONTENT.primaryCta}</span>
                <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
              </a>

              <a
                href={buildDirectWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] text-sm sm:text-base font-semibold text-zinc-900 bg-white border border-zinc-300 hover:border-[#E63946] hover:text-[#E63946] rounded-xl transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
              >
                <MessageCircle className="w-4 h-4 text-[#E63946]" aria-hidden="true" />
                <span>{SITE_BRAND.phoneDisplay}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Three.js 3D Studio Viewport */}
          <div className="lg:col-span-7 flex">
            <ThreeCleaningScene />
          </div>
        </div>
      </div>
    </section>
  );
}
