import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMailtoUrl,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  validateContactForm,
  WHATSAPP_NUMBER_DIGITS,
} from './contactHelpers';

test('validateContactForm rejects empty or invalid inputs', () => {
  const errors = validateContactForm({
    nome: 'A',
    email: 'invalido',
    mensagem: 'Oi',
  });

  assert.ok(errors.nome);
  assert.ok(errors.email);
  assert.ok(errors.mensagem);
});

test('validateContactForm accepts valid contact inputs', () => {
  const errors = validateContactForm({
    nome: 'Maria Silva',
    email: 'maria@exemplo.com.br',
    mensagem: 'Preciso de orçamento para limpeza residencial completa.',
  });

  assert.deepEqual(errors, {});
});

test('buildWhatsAppMessage includes name, email, message, and website origin', () => {
  const msg = buildWhatsAppMessage({
    nome: 'João Pedro',
    email: 'joao@exemplo.com',
    mensagem: 'Gostaria de agendar limpeza comercial.',
  });

  assert.match(msg, /site da mix limpeza/i);
  assert.match(msg, /Nome: João Pedro/);
  assert.match(msg, /E-mail: joao@exemplo.com/);
  assert.match(msg, /Mensagem: Gostaria de agendar limpeza comercial\./);
});

test('buildWhatsAppUrl points to 5562991068467 with encoded payload', () => {
  const url = buildWhatsAppUrl({
    nome: 'Ana Clara',
    email: 'ana@exemplo.com',
    mensagem: 'Limpeza pós-obra em apartamento.',
  });

  assert.ok(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER_DIGITS}?text=`));
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.match(decoded, /Ana Clara/);
  assert.match(decoded, /ana@exemplo\.com/);
  assert.match(decoded, /Limpeza pós-obra em apartamento\./);
  assert.match(decoded, /site da mix limpeza/i);
});

test('buildMailtoUrl generates encoded mailto link', () => {
  const url = buildMailtoUrl({
    nome: 'Carlos',
    email: 'carlos@exemplo.com',
    mensagem: 'Solicito orçamento.',
  });

  assert.ok(url.startsWith('mailto:'));
  assert.match(url, /subject=/);
  assert.match(url, /body=/);
});
