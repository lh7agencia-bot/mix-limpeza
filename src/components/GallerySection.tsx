import { useState } from 'react';
import { Expand, Sparkles } from 'lucide-react';
import { GALLERY_CONTENT } from '../config/siteContent';
import { LightboxModal } from './LightboxModal';

export function GallerySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const items = GALLERY_CONTENT.items;

  const handleImageError = (id: string) => {
    setFailedIds((prev) => ({ ...prev, [id]: true }));
  };

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev - 1 + items.length) % items.length,
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev + 1) % items.length,
    );
  };

  return (
    <section
      id="galeria"
      className="scroll-mt-20 bg-[#F5F5F5] py-16 sm:py-20 lg:py-24 border-b border-zinc-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#C82835] mb-2">
              {GALLERY_CONTENT.sectionLabel}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 [text-wrap:balance]">
              {GALLERY_CONTENT.heading}
            </h2>
            <p className="mt-3 text-base text-zinc-600 leading-relaxed">
              {GALLERY_CONTENT.subtitle}
            </p>
          </div>
          <p className="text-sm text-zinc-500 whitespace-nowrap shrink-0">
            {items.length} registros · Clique para ampliar
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const isFailed = Boolean(failedIds[item.id]);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Ampliar foto: ${item.title}`}
                className="group text-left rounded-2xl bg-white border border-zinc-200 overflow-hidden hover:border-[#E63946] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                  {isFailed ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#F5F5F5] to-zinc-200 text-zinc-700">
                      <Sparkles className="w-7 h-7 text-[#E63946] mb-2" />
                      <span className="font-display text-sm font-semibold text-center">
                        {item.title}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.alt}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() => handleImageError(item.id)}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                  )}

                  <span className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/95 text-zinc-800 group-hover:bg-[#E63946] group-hover:text-white transition-colors shadow-sm">
                    <Expand className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>mix limpeza</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-bold text-zinc-900 group-hover:text-[#E63946] transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <LightboxModal
        items={items}
        activeIndex={activeIndex}
        failedIds={failedIds}
        onClose={() => setActiveIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </section>
  );
}
