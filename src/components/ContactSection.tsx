import { useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, Mail, MessageCircle, Send } from 'lucide-react';
import { SITE_BRAND } from '../config/siteContent';
import {
  buildMailtoUrl,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  type ContactValidationErrors,
  validateContactForm,
} from '../utils/contactHelpers';

export function ContactSection() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const [submittedState, setSubmittedState] = useState<{
    channel: 'whatsapp' | 'email';
    whatsAppUrl: string;
    mailtoUrl: string;
    previewText: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (
    e: React.FormEvent,
    channel: 'whatsapp' | 'email' = 'whatsapp',
  ) => {
    e.preventDefault();
    const values = { nome, email, mensagem };
    const nextErrors = validateContactForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    const whatsAppUrl = buildWhatsAppUrl(values);
    const mailtoUrl = buildMailtoUrl(values, SITE_BRAND.contactEmail);
    const previewText = buildWhatsAppMessage(values);

    setSubmittedState({
      channel,
      whatsAppUrl,
      mailtoUrl,
      previewText,
    });
    setCopied(false);

    // Trigger anchor navigation cleanly without using window.open/window.alert
    const anchor = document.createElement('a');
    anchor.href = channel === 'whatsapp' ? whatsAppUrl : mailtoUrl;
    if (channel === 'whatsapp') {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    anchor.click();
  };

  const handleCopyMessage = async () => {
    if (!submittedState) return;
    try {
      await navigator.clipboard.writeText(submittedState.previewText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="contato"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Direct Contact Context */}
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold text-[#C82835] mb-2">
              Contato e Orçamento
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 [text-wrap:balance]">
              Fale direto com a {SITE_BRAND.name}
            </h2>
            <p className="mt-4 text-base text-zinc-600 leading-relaxed">
              Preencha seu nome, e-mail e detalhes do ambiente. Ao enviar,
              geramos automaticamente a mensagem pronta para o nosso WhatsApp{' '}
              <span className="font-semibold text-zinc-900 tabular-nums">
                {SITE_BRAND.phoneDisplay}
              </span>{' '}
              com seus dados identificados pelo site.
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-[#F5F5F5] border border-zinc-200 space-y-4">
              <div>
                <p className="text-xs font-medium text-zinc-500">
                  WhatsApp Oficial
                </p>
                <a
                  href={`https://wa.me/${SITE_BRAND.whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-2 font-display text-lg font-bold text-zinc-900 hover:text-[#E63946] transition-colors tabular-nums"
                >
                  <MessageCircle className="w-5 h-5 text-[#E63946]" aria-hidden="true" />
                  <span>{SITE_BRAND.phoneDisplay}</span>
                </a>
              </div>

              <div className="pt-4 border-t border-zinc-200">
                <p className="text-xs font-medium text-zinc-500">Slogan</p>
                <p className="mt-1 text-sm font-semibold text-zinc-800">
                  {SITE_BRAND.name} · {SITE_BRAND.slogan}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <form
              noValidate
              onSubmit={(e) => handleSubmit(e, 'whatsapp')}
              className="p-6 sm:p-8 rounded-2xl bg-[#F5F5F5] border border-zinc-200 space-y-5"
            >
              <div>
                <label
                  htmlFor="contato-nome"
                  className="block text-sm font-semibold text-zinc-800 mb-1.5"
                >
                  Nome completo
                </label>
                <input
                  id="contato-nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={Boolean(errors.nome)}
                  aria-describedby={errors.nome ? 'erro-nome' : undefined}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20"
                />
                {errors.nome && (
                  <p id="erro-nome" className="mt-1.5 text-xs font-medium text-[#C82835]">
                    {errors.nome}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contato-email"
                  className="block text-sm font-semibold text-zinc-800 mb-1.5"
                >
                  E-mail
                </label>
                <input
                  id="contato-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'erro-email' : undefined}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20"
                />
                {errors.email && (
                  <p id="erro-email" className="mt-1.5 text-xs font-medium text-[#C82835]">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contato-mensagem"
                  className="block text-sm font-semibold text-zinc-800 mb-1.5"
                >
                  Mensagem
                </label>
                <textarea
                  id="contato-mensagem"
                  name="mensagem"
                  rows={4}
                  placeholder="Conte qual tipo de limpeza precisa (residencial, comercial, pós-obra) e o melhor horário para atendimento..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  aria-invalid={Boolean(errors.mensagem)}
                  aria-describedby={errors.mensagem ? 'erro-mensagem' : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20 resize-y"
                />
                {errors.mensagem && (
                  <p id="erro-mensagem" className="mt-1.5 text-xs font-medium text-[#C82835]">
                    {errors.mensagem}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl bg-[#E63946] hover:bg-[#C82835] text-white text-sm sm:text-base font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Enviar via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'email')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] rounded-xl bg-white border border-zinc-300 hover:border-[#E63946] text-zinc-800 hover:text-[#E63946] text-sm sm:text-base font-semibold transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946]"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>Enviar por E-mail</span>
                </button>
              </div>

              {submittedState && (
                <div
                  role="status"
                  aria-live="polite"
                  data-testid="contact-confirmation"
                  className="mt-4 p-5 rounded-xl bg-white border border-emerald-300 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-display text-sm sm:text-base font-bold text-zinc-900">
                        Mensagem pronta para envio via{' '}
                        {submittedState.channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                      </p>
                      <p className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                        Confira o texto gerado automaticamente com sua identificação do site:
                      </p>
                    </div>
                  </div>

                  <pre className="p-3.5 rounded-lg bg-[#F5F5F5] border border-zinc-200 text-xs sm:text-sm text-zinc-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {submittedState.previewText}
                  </pre>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={submittedState.whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-lg bg-[#E63946] hover:bg-[#C82835] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      <span>Abrir conversa no WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-lg border border-zinc-300 bg-white hover:border-zinc-400 text-zinc-800 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>{copied ? 'Texto copiado' : 'Copiar mensagem'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
