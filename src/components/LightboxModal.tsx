import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import type { GalleryItem } from '../config/siteContent';

interface LightboxModalProps {
  items: GalleryItem[];
  activeIndex: number | null;
  failedIds: Record<string, boolean>;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function LightboxModal({
  items,
  activeIndex,
  failedIds,
  onClose,
  onPrev,
  onNext,
}: LightboxModalProps) {
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, onClose, onPrev, onNext]);

  if (activeIndex === null) return null;
  const activeItem = items[activeIndex];
  if (!activeItem) return null;

  const isFailed = Boolean(failedIds[activeItem.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização ampliada: ${activeItem.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white overflow-hidden shadow-2xl border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Lightbox Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-zinc-200 bg-[#F5F5F5]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>{activeItem.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {activeIndex + 1} de {items.length}
              </span>
            </div>
            <h3 className="font-display text-base sm:text-lg font-bold text-zinc-900 truncate">
              {activeItem.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar visualização da foto"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-[#E63946] hover:border-[#E63946] transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Stage */}
        <div className="relative bg-[#F5F5F5] max-h-[68vh] w-full flex items-center justify-center overflow-hidden p-2 sm:p-4">
          {isFailed ? (
            <div className="flex flex-col items-center justify-center text-center p-8 text-zinc-600">
              <ImageOff className="w-10 h-10 mb-3 text-[#E63946]" />
              <p className="font-display font-semibold text-zinc-900">{activeItem.title}</p>
              <p className="text-sm text-zinc-500 mt-1">{activeItem.caption}</p>
            </div>
          ) : (
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              referrerPolicy="no-referrer"
              className="max-h-[64vh] w-auto max-w-full rounded-xl object-contain shadow-sm"
            />
          )}
        </div>

        {/* Footer Caption + Prev/Next Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 bg-white border-t border-zinc-200">
          <p className="text-sm text-zinc-600 leading-relaxed">
            {activeItem.caption}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Foto anterior"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg border border-zinc-300 bg-white text-sm font-semibold text-zinc-800 hover:border-[#E63946] hover:text-[#E63946] transition-colors whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Próxima foto"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg bg-[#E63946] hover:bg-[#C82835] text-sm font-semibold text-white transition-colors whitespace-nowrap"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
