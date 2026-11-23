import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_CONTENT } from '../config/siteContent';

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_CONTENT.items[0]?.id ?? null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="scroll-mt-20 bg-[#F5F5F5] py-16 sm:py-20 lg:py-24 border-b border-zinc-200/80"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#C82835] mb-2">
            {FAQ_CONTENT.sectionLabel}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 [text-wrap:balance]">
            {FAQ_CONTENT.heading}
          </h2>
          <p className="mt-3 text-base text-zinc-600 leading-relaxed">
            {FAQ_CONTENT.subtitle}
          </p>
        </div>

        <div className="mt-10 divide-y divide-zinc-200 rounded-2xl bg-white border border-zinc-200 overflow-hidden">
          {FAQ_CONTENT.items.map((item) => {
            const isOpen = openId === item.id;
            const panelId = `faq-panel-${item.id}`;

            return (
              <div key={item.id}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#F5F5F5]/60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#E63946]"
                  >
                    <span className="font-display text-base sm:text-lg font-semibold text-zinc-900">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#E63946] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>

                <div
                  id={panelId}
                  hidden={!isOpen}
                  className="px-6 pb-5 text-sm sm:text-base text-zinc-600 leading-relaxed"
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
