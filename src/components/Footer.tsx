import { NAV_LINKS, SITE_BRAND } from '../config/siteContent';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 text-zinc-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-800">
          <div>
            <p className="font-display text-xl font-bold text-white">
              {SITE_BRAND.name}
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              {SITE_BRAND.slogan} · WhatsApp {SITE_BRAND.phoneDisplay}
            </p>
          </div>

          <nav aria-label="Links do rodapé" className="flex flex-wrap items-center gap-5 text-sm">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <p>
            © {year} {SITE_BRAND.name}. Todos os direitos reservados.
          </p>
          <p>Atendimento agendado diretamente pelo WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
}
