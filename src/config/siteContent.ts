/**
 * ============================================================================
 * CONFIGURAÇÃO CENTRAL DE TEXTOS E IMAGENS — mix limpeza
 * ============================================================================
 * Este arquivo concentra todos os textos, serviços, fotos da galeria,
 * depoimentos e perguntas frequentes (FAQ) da landing page.
 *
 * COMO PERSONALIZAR PARA A VERCEL:
 * 1. Para alterar textos: edite diretamente os campos abaixo mantendo as aspas.
 * 2. Para trocar as fotos da galeria na Vercel:
 *    - Salve suas fotos dentro da pasta `public/images/` (ex: `public/images/foto-1.jpg`).
 *    - Substitua o campo `src` abaixo pelo caminho `/images/foto-1.jpg`.
 * ============================================================================
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  benefit: string;
  description: string;
  highlights: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  src: string;
  alt: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  serviceType: string;
  rating: number;
  text: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const SITE_BRAND = {
  name: 'mix limpeza',
  slogan: 'Limpeza que brilha',
  phoneDisplay: '(62) 99106-8467',
  whatsappDigits: '5562991068467',
  contactEmail: 'contato@mixlimpeza.com.br',
} as const;

export const NAV_LINKS: NavItem[] = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contato', href: '#contato' },
];

export const HERO_CONTENT = {
  eyebrow: 'mix limpeza · Atendimento via WhatsApp (62) 99106-8467',
  headline: 'Limpeza que brilha em cada detalhe do seu espaço',
  subtitle:
    'Cuidado técnico, acabamento minucioso e pontualidade para transformar ambientes residenciais e comerciais com praticidade e confiança.',
  primaryCta: 'Solicitar Orçamento',
  secondaryCta: 'Falar no WhatsApp',
  highlights: [
    'Atendimento residencial e comercial',
    'Orçamento rápido pelo WhatsApp',
    'Cuidado com superfícies delicadas',
  ],
};

export const SERVICES_CONTENT = {
  sectionLabel: 'Nossos Serviços',
  heading: 'Soluções sob medida para manter seu ambiente impecável',
  subtitle:
    'Atendemos residências, escritórios e entregas pós-obra com equipe cuidadosa, organização e acabamento que valoriza cada espaço.',
  items: [
    {
      id: 'residencial',
      number: '01',
      title: 'Limpeza Residencial',
      benefit: 'Mais tempo livre e conforto para sua rotina',
      description:
        'Higienização completa de salas, quartos, cozinhas e banheiros com atenção especial a pisos, bancadas e acabamentos.',
      highlights: ['Remoção de poeira detalhada', 'Cuidado com móveis e estofados', 'Acabamento sem manchas'],
    },
    {
      id: 'comercial',
      number: '02',
      title: 'Limpeza Comercial',
      benefit: 'Ambiente organizado que valoriza seu atendimento',
      description:
        'Manutenção de escritórios, lojas e consultórios para garantir recepções limpas, vidros transparentes e estações higienizadas.',
      highlights: ['Flexibilidade de horários', 'Higienização de áreas comuns', 'Padronização visual contínua'],
    },
    {
      id: 'pos-obra',
      number: '03',
      title: 'Limpeza Pós-Obra',
      benefit: 'Entrega pronta para uso sem vestígios de reforma',
      description:
        'Remoção cuidadosa de respingos de tinta, pó fino de gesso, cimento e resíduos em esquadrias, vidros e revestimentos novos.',
      highlights: ['Preservação de porcelanatos', 'Limpeza fina de trilhos e vidros', 'Remoção segura de resíduos'],
    },
    {
      id: 'vidros-detalhes',
      number: '04',
      title: 'Vidros e Higienização Profunda',
      benefit: 'Transparência e brilho renovado em cada superfície',
      description:
        'Tratamento direcionado para janelas, portas de vidro, box de banheiro, metais cromados e áreas de alta circulação.',
      highlights: ['Vidros sem marcas de pano', 'Polimento de metais e inox', 'Atenção a cantos e rejuntes'],
    },
  ] as ServiceItem[],
};

export const GALLERY_CONTENT = {
  sectionLabel: 'Galeria de Fotos',
  heading: 'Resultados reais de quem valoriza cada acabamento',
  subtitle:
    'Confira registros de ambientes higienizados pela mix limpeza. Clique em qualquer foto para visualizar em tamanho ampliado.',
  items: [
    {
      id: 'foto-01',
      title: 'Sala de Estar e Pisos',
      category: 'Residencial',
      caption: 'Piso tratado com brilho uniforme, remoção fina de poeira e organização completa.',
      src: '/src/assets/images/gallery_sala_estar_1795457307421.jpg',
      alt: 'Sala de estar limpa com piso de madeira brilhando e sofá branco organizado',
    },
    {
      id: 'foto-02',
      title: 'Cozinha e Bancadas',
      category: 'Higienização',
      caption: 'Bancadas desengorduradas, metais polidos e superfícies prontas para o uso diário.',
      src: '/src/assets/images/gallery_cozinha_brilho_1795457308691.jpg',
      alt: 'Cozinha moderna branca com bancada impecável e torneira cromada brilhando',
    },
    {
      id: 'foto-03',
      title: 'Banheiro e Box de Vidro',
      category: 'Detalhamento',
      caption: 'Vidro transparente sem manchas, louças sanitárias higienizadas e metais reluzentes.',
      src: '/src/assets/images/gallery_banheiro_cristal_1795457309036.jpg',
      alt: 'Banheiro limpo com box de vidro transparente e toalhas brancas dobradas',
    },
    {
      id: 'foto-04',
      title: 'Ambiente Corporativo',
      category: 'Comercial',
      caption: 'Janelas amplas, mesa de reunião higienizada e piso com acabamento espelhado.',
      src: '/src/assets/images/gallery_escritorio_limpo_1795457308771.jpg',
      alt: 'Escritório moderno limpo com amplas janelas de vidro e piso polido',
    },
  ] as GalleryItem[],
};

export const TESTIMONIALS_CONTENT = {
  sectionLabel: 'Depoimentos',
  heading: 'Avaliações de quem já contratou',
  subtitle:
    'Relatos de clientes atendidos pela mix limpeza que comprovam nosso padrão de pontualidade, cuidado e brilho.',
  items: [
    {
      id: 'dep-01',
      name: 'Mariana Souza',
      serviceType: 'Limpeza Residencial',
      rating: 5,
      text: 'Capricho impressionante em cada cômodo. Os vidros, a cozinha e os rodapés ficaram impecáveis, sem cheiro forte e com entrega pontual.',
    },
    {
      id: 'dep-02',
      name: 'Rafael Oliveira',
      serviceType: 'Limpeza Pós-Obra',
      rating: 5,
      text: 'Depois da reforma achei que o pó fino não sairia tão cedo. A equipe da mix limpeza deixou o apartamento pronto para mudança no mesmo dia.',
    },
    {
      id: 'dep-03',
      name: 'Camila Ferreira',
      serviceType: 'Limpeza Comercial',
      rating: 5,
      text: 'Atendimento ágil desde o primeiro contato no WhatsApp. Organização, discrição e cuidado evidente com cada detalhe do nosso espaço.',
    },
  ] as TestimonialItem[],
};

export const FAQ_CONTENT = {
  sectionLabel: 'Perguntas Frequentes',
  heading: 'Dúvidas comuns sobre nossos serviços',
  subtitle:
    'Confira as respostas rápidas abaixo ou envie sua dúvida diretamente pelo formulário ou WhatsApp.',
  items: [
    {
      id: 'faq-01',
      question: 'Como solicito um orçamento com a mix limpeza?',
      answer:
        'Basta preencher o formulário de contato nesta página ou clicar no botão do WhatsApp (62) 99106-8467. Informe o tipo de ambiente, tamanho aproximado e o serviço desejado para receber um retorno rápido.',
    },
    {
      id: 'faq-02',
      question: 'Vocês levam os produtos e equipamentos de limpeza?',
      answer:
        'Sim, podemos atender com linha completa de produtos adequados para cada tipo de superfície (porcelanato, madeira, vidro, inox e pedra) ou utilizar insumos específicos do cliente, conforme combinado no orçamento.',
    },
    {
      id: 'faq-03',
      question: 'Qual a diferença entre limpeza residencial comum e limpeza pós-obra?',
      answer:
        'A limpeza residencial foca na higienização e manutenção da rotina do lar. Já a limpeza pós-obra utiliza técnicas e produtos específicos para remover respingos de tinta, rejunte, cola e poeira fina acumulada após reformas.',
    },
    {
      id: 'faq-04',
      question: 'É possível agendar limpeza comercial fora do horário de expediente?',
      answer:
        'Sim. Alinhamos os horários de atendimento comercial de acordo com a rotina do seu espaço para não interromper o fluxo de clientes ou colaboradores.',
    },
    {
      id: 'faq-05',
      question: 'Como funciona o agendamento e a confirmação do horário?',
      answer:
        'Após o envio da sua solicitação pelo formulário ou WhatsApp (62) 99106-8467, alinhamos a data, o turno de preferência e os detalhes do imóvel para confirmar o atendimento sem complicações.',
    },
  ] as FaqItem[],
};
