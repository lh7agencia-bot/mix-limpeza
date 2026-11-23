import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS, SITE_BRAND } from '../config/siteContent';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const id = href.replace('#', '');
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#topo"
          onClick={(e) => handleAnchorClick(e, '#topo')}
          className="font-display text-xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E63946]"
        >
          {SITE_BRAND.name}
        </a>

        {/* Zone 2: Concise single-line anchor navigation links */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className="py-1 text-zinc-700 hover:text-[#E63946] border-b-2 border-transparent hover:border-[#E63946] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E63946]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action + mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#contato"
            onClick={(e) => handleAnchorClick(e, '#contato')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82835] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
          >
            Solicitar Orçamento
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="menu-mobile"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-zinc-700 hover:text-zinc-900 hover:bg-[#F5F5F5] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <nav
          id="menu-mobile"
          aria-label="Navegação móvel"
          className="md:hidden bg-white border-t border-zinc-200 px-4 py-3 space-y-1"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className="flex items-center min-h-[44px] px-3 rounded-lg text-base font-medium text-zinc-800 hover:bg-[#F5F5F5] hover:text-[#E63946] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 pb-1">
            <a
              href="#contato"
              onClick={(e) => handleAnchorClick(e, '#contato')}
              className="flex items-center justify-center w-full min-h-[44px] px-4 py-2.5 text-sm font-semibold text-white bg-[#E63946] hover:bg-[#C82835] rounded-lg transition-colors"
            >
              Solicitar Orçamento
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
