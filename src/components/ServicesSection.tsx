import { ArrowUpRight, Check } from 'lucide-react';
import { SERVICES_CONTENT } from '../config/siteContent';

export function ServicesSection() {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById('contato');
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="servicos"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24 border-b border-zinc-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#C82835] mb-2">
            {SERVICES_CONTENT.sectionLabel}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 [text-wrap:balance]">
            {SERVICES_CONTENT.heading}
          </h2>
          <p className="mt-3 text-base text-zinc-600 leading-relaxed">
            {SERVICES_CONTENT.subtitle}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {SERVICES_CONTENT.items.map((service) => (
            <article
              key={service.id}
              className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#F5F5F5] border border-zinc-200/90 hover:border-[#E63946]/50 transition-colors duration-150"
            >
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-sm font-semibold tabular-nums text-[#C82835]">
                    {service.number}.
                  </span>
                  <span className="text-xs font-medium text-zinc-500">
                    {service.benefit}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-xl sm:text-2xl font-bold text-zinc-900">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {service.description}
                </p>

                <ul className="mt-5 pt-5 border-t border-zinc-200/80 space-y-2 text-sm text-zinc-700">
                  {service.highlights.map((point) => (
                    <li key={point} className="flex items-center gap-2.5">
                      <Check
                        className="w-4 h-4 text-[#E63946] shrink-0"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4">
                <a
                  href="#contato"
                  onClick={scrollToContact}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C82835] hover:text-[#E63946] transition-colors whitespace-nowrap"
                >
                  <span>Solicitar orçamento para este serviço</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
