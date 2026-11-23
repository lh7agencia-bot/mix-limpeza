import { Star } from 'lucide-react';
import { TESTIMONIALS_CONTENT } from '../config/siteContent';

export function TestimonialsSection() {
  return (
    <section
      id="depoimentos"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24 border-b border-zinc-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#C82835] mb-2">
            {TESTIMONIALS_CONTENT.sectionLabel}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 [text-wrap:balance]">
            {TESTIMONIALS_CONTENT.heading}
          </h2>
          <p className="mt-3 text-base text-zinc-600 leading-relaxed">
            {TESTIMONIALS_CONTENT.subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS_CONTENT.items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#F5F5F5] border border-zinc-200/90"
            >
              <div>
                <div
                  className="flex items-center gap-1"
                  aria-label={`Avaliação: ${item.rating} de 5 estrelas`}
                >
                  {Array.from({ length: 5 }, (_, idx) => {
                    const filled = idx < item.rating;
                    return (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          filled
                            ? 'fill-[#E63946] text-[#E63946]'
                            : 'text-zinc-300'
                        }`}
                        aria-hidden="true"
                      />
                    );
                  })}
                </div>

                <blockquote className="mt-4 text-base text-zinc-700 leading-relaxed">
                  “{item.text}”
                </blockquote>
              </div>

              <footer className="mt-6 pt-4 border-t border-zinc-200/80">
                <p className="font-display text-base font-bold text-zinc-900">
                  {item.name}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{item.serviceType}</p>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
