export interface ContactFormValues {
  nome: string;
  email: string;
  mensagem: string;
}

export interface ContactValidationErrors {
  nome?: string;
  email?: string;
  mensagem?: string;
}

export const WHATSAPP_NUMBER_DIGITS = '5562991068467';
export const PHONE_DISPLAY = '(62) 99106-8467';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(
  values: ContactFormValues,
): ContactValidationErrors {
  const errors: ContactValidationErrors = {};
  const nome = values.nome.trim();
  const email = values.email.trim();
  const mensagem = values.mensagem.trim();

  if (nome.length < 2) {
    errors.nome = 'Informe seu nome completo para continuar.';
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    errors.email = 'Informe um endereço de e-mail válido.';
  }

  if (mensagem.length < 5) {
    errors.mensagem = 'Escreva uma breve mensagem descrevendo o serviço desejado.';
  }

  return errors;
}

export function buildWhatsAppMessage(values: ContactFormValues): string {
  const nome = values.nome.trim();
  const email = values.email.trim();
  const mensagem = values.mensagem.trim();

  return [
    'Olá! Estou entrando em contato pelo site da mix limpeza.',
    '',
    `Nome: ${nome}`,
    `E-mail: ${email}`,
    `Mensagem: ${mensagem}`,
  ].join('\n');
}

export function buildWhatsAppUrl(values: ContactFormValues): string {
  const text = buildWhatsAppMessage(values);
  return `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${encodeURIComponent(text)}`;
}

export function buildDirectWhatsAppUrl(customGreeting?: string): string {
  const defaultGreeting =
    'Olá! Vim pelo site da mix limpeza e gostaria de solicitar um orçamento.';
  return `https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=${encodeURIComponent(
    customGreeting ?? defaultGreeting,
  )}`;
}

export function buildMailtoUrl(
  values: ContactFormValues,
  destinationEmail = 'contato@mixlimpeza.com.br',
): string {
  const subject = `Orçamento via site mix limpeza — ${values.nome.trim()}`;
  const body = buildWhatsAppMessage(values);
  return `mailto:${destinationEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
