/* Mock data for the admin panel demo — fully anonymized. */

const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 86400_000).toISOString();
const daysFromNow = (d) => new Date(Date.now() + d * 86400_000).toISOString();

export function getInitialPosts() {
  return [
    {
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      headline: 'Protección para tu familia sin complicaciones',
      product: 'Seguro de Vida',
      post_text:
        'Hablar de seguros de vida puede parecer incómodo, pero es uno de los actos de amor más grandes que podemos dar.\n\nNuestro plan cubre hasta 2M pesos con un pago mensual accesible, sin exámenes médicos y con trámite 100% digital. Tu familia tendrá la tranquilidad que merece.',
      status: 'draft',
      scheduled_for: null,
      target_platforms: ['facebook', 'instagram'],
      bg_image_url: '/admin-panel-demo/thumbnails/post-sample-1.svg',
      platform_status: {},
      updated_at: hoursAgo(2),
      _demoThumbnail: '/admin-panel-demo/thumbnails/post-sample-1.svg',
    },
    {
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      headline: 'Gastos médicos mayores cubiertos al 100%',
      product: 'Seguro Médico',
      post_text:
        'Una hospitalización puede costar más que un auto nuevo. Con nuestro Seguro Médico Mayor tienes acceso a los mejores hospitales del país, sin deducibles sorpresa y con cobertura internacional.\n\nConsulta con un asesor y recibe tu cotización en menos de 24 horas.',
      status: 'draft',
      scheduled_for: daysFromNow(1),
      target_platforms: ['facebook', 'instagram'],
      bg_image_url: '/admin-panel-demo/thumbnails/post-sample-2.svg',
      platform_status: {},
      updated_at: hoursAgo(5),
      _demoThumbnail: '/admin-panel-demo/thumbnails/post-sample-2.svg',
    },
    {
      uuid: '550e8400-e29b-41d4-a716-446655440003',
      headline: 'Becas para que tus hijos no dejen de estudiar',
      product: 'Becas',
      post_text:
        'Un plan de becas educativas asegura que la educación de tus hijos continúe sin importar lo que pase. Ahorra mes a mes y al cumplir 18 años tendrán el respaldo para la universidad.',
      status: 'published',
      scheduled_for: null,
      target_platforms: ['facebook', 'instagram'],
      bg_image_url: '/admin-panel-demo/thumbnails/post-sample-3.svg',
      platform_status: {
        facebook: { status: 'published', post_url: 'https://facebook.com/demo/post/abc123', request_id: 'fb_demo_001' },
        instagram: { status: 'published', post_url: 'https://instagram.com/p/demo_abc123', request_id: 'ig_demo_001' },
      },
      updated_at: daysAgo(1),
      _demoThumbnail: '/admin-panel-demo/thumbnails/post-sample-3.svg',
    },
    {
      uuid: '550e8400-e29b-41d4-a716-446655440004',
      headline: 'Plan Familiar — una sola póliza, cobertura completa',
      product: 'Plan Familiar',
      post_text:
        'Cubre a toda tu familia con una sola póliza: padres, hijos y dependientes. Menos papeleo, más tranquilidad.',
      status: 'published',
      scheduled_for: null,
      target_platforms: ['facebook', 'instagram'],
      bg_image_url: '/admin-panel-demo/thumbnails/post-sample-1.svg',
      platform_status: {
        facebook: { status: 'published', post_url: 'https://facebook.com/demo/post/fam456', request_id: 'fb_demo_002' },
        instagram: { status: 'failed', error_message: 'Media upload rejected', request_id: 'ig_demo_002' },
      },
      updated_at: daysAgo(2),
      _demoThumbnail: '/admin-panel-demo/thumbnails/post-sample-1.svg',
    },
    {
      uuid: '550e8400-e29b-41d4-a716-446655440005',
      headline: 'Gastos funerarios: un tema que vale la pena planear',
      product: 'Funerario',
      post_text:
        'Nadie quiere pensar en ello, pero un plan funerario evita que tu familia cargue con decisiones y gastos en el peor momento.',
      status: 'paused',
      scheduled_for: null,
      target_platforms: ['facebook'],
      bg_image_url: '/admin-panel-demo/thumbnails/post-sample-2.svg',
      platform_status: {},
      updated_at: daysAgo(3),
      _demoThumbnail: '/admin-panel-demo/thumbnails/post-sample-2.svg',
    },
  ];
}

export function getInitialSessions() {
  return [
    {
      sessionId: 'SESS_001_IG',
      paused: false,
      messages: [
        { type: 'human', content: 'Hola, vi un post sobre seguros de vida' },
        { type: 'bot', content: '¡Hola! Claro, te puedo orientar. ¿Para quién buscas cobertura?' },
        { type: 'human', content: 'Para mí y mi esposa, tenemos dos hijos' },
        { type: 'bot', content: 'Perfecto. Un Plan Familiar suele ser la mejor opción. ¿Quieres que te envíe una cotización rápida?' },
        { type: 'human', content: 'Sí, por favor' },
      ],
    },
    {
      sessionId: 'SESS_002_IG',
      paused: true,
      messages: [
        { type: 'human', content: '¿Cuánto cuesta el seguro médico mayor?' },
        { type: 'bot', content: 'Depende de edad y nivel de cobertura. ¿Me compartes tu edad?' },
        { type: 'human', content: '42 años' },
        { type: 'bot', content: 'Para 42 años, el plan básico ronda los $1,850 MXN mensuales...' },
      ],
    },
    {
      sessionId: 'SESS_003_IG',
      paused: false,
      messages: [
        { type: 'human', content: 'Quiero información sobre becas educativas' },
        { type: 'bot', content: 'Con gusto. ¿La beca es para primaria, secundaria o universidad?' },
        { type: 'human', content: 'Apenas va a nacer mi bebé' },
        { type: 'bot', content: '¡Qué bueno que piensas con tiempo! El plan desde el nacimiento tiene el mejor rendimiento.' },
        { type: 'human', content: '¿Me envías más información?' },
        { type: 'bot', content: 'Claro. ¿Te llamo mañana en la mañana?' },
      ],
    },
  ];
}

export function getInitialMergeRequests() {
  return [
    {
      _id: 'merge_demo_001',
      matchedValue: 'maria.lopez@example.com',
      sourceA: 'website',
      sourceB: 'instagram',
      conflicts: [
        { field: 'name', valueA: 'María López', valueB: 'Maria L.' },
        { field: 'phone', valueA: '+52 555 000 0001', valueB: null },
      ],
      autoMerge: ['email', 'created_at', 'source'],
    },
    {
      _id: 'merge_demo_002',
      matchedValue: 'carlos.m@example.com',
      sourceA: 'website',
      sourceB: 'instagram',
      conflicts: [
        { field: 'name', valueA: 'Carlos Mendoza', valueB: 'Carlos M' },
      ],
      autoMerge: ['email', 'created_at', 'phone'],
    },
  ];
}

export function getInitialBlockedDays() {
  const today = new Date();
  const mkDate = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  return [
    { date: mkDate(3), timeSlots: null },
    { date: mkDate(7), timeSlots: ['09:00', '09:45', '10:30'] },
    { date: mkDate(14), timeSlots: null },
  ];
}

export function getInitialEmailConfig() {
  return {
    auto_send_enabled: true,
    min_confidence_to_send: 0.75,
    rate_limit_per_sender_per_hour: 5,
  };
}

export function getInitialEmailStats() {
  return {
    '24h': {
      received: 42,
      auto_replied: 28,
      queue_pending: 4,
      dismissed: 9,
      avg_latency_sec: 12.4,
      cost_usd: '0.1280',
    },
    '7d': {
      received: 284,
      auto_replied: 196,
      queue_pending: 18,
      dismissed: 52,
      avg_latency_sec: 11.8,
      cost_usd: '0.8620',
    },
    '30d': {
      received: 1210,
      auto_replied: 834,
      queue_pending: 41,
      dismissed: 218,
      avg_latency_sec: 12.1,
      cost_usd: '3.7450',
    },
  };
}

export function getInitialEmailQueue() {
  return [
    {
      queue_id: 'q_demo_001',
      sender_name: 'Ana Ramírez',
      sender_email: 'ana.ramirez@example.com',
      subject: '¿Qué plan me conviene para mi mamá de 68?',
      body_text:
        'Hola, mi mamá tiene 68 años y está buscando un seguro que cubra gastos médicos. ¿Tienen algo para esa edad? Gracias.',
      suggested_reply:
        'Hola Ana,\n\nGracias por escribirnos. Sí contamos con planes para adultos mayores — un asesor te va a contactar para explicarte las opciones disponibles según el perfil de tu mamá.\n\nSaludos.',
      reason: 'low_confidence',
      reason_detail: 'confidence=0.62',
      classification: { intent: 'inquiry', topic: 'product_selection', confidence: 0.62 },
      queued_at: hoursAgo(3),
    },
    {
      queue_id: 'q_demo_002',
      sender_name: 'Desconocido',
      sender_email: 'spam.sender@example.com',
      subject: 'Re: Partnership opportunity',
      body_text: 'Hi, I represent a marketing agency and we would like to partner with you...',
      suggested_reply: null,
      reason: 'off_topic',
      reason_detail: 'not_insurance_related',
      classification: { intent: 'partnership_pitch', topic: 'other', confidence: 0.91 },
      queued_at: hoursAgo(6),
    },
    {
      queue_id: 'q_demo_003',
      sender_name: 'Juan García',
      sender_email: 'juan.garcia@example.com',
      subject: 'Cancelar póliza — urgente',
      body_text:
        'Necesito cancelar mi póliza hoy mismo. Ya no puedo pagarla y me están cobrando. Por favor respondan rápido.',
      suggested_reply:
        'Hola Juan,\n\nLamento la situación. Una cancelación requiere validación de identidad, así que te voy a canalizar con un ejecutivo que te contactará en las próximas horas para procesar el trámite de forma segura.',
      reason: 'validator_rejected',
      reason_detail: 'response mentions timeframe not guaranteed by policy',
      classification: { intent: 'cancellation', topic: 'billing', confidence: 0.88 },
      queued_at: hoursAgo(1),
    },
    {
      queue_id: 'q_demo_004',
      sender_name: 'Laura Fernández',
      sender_email: 'laura.f@example.com',
      subject: 'Comprobante de pago',
      body_text: 'Adjunto mi comprobante del pago mensual para que lo apliquen. Saludos.',
      suggested_reply: null,
      reason: 'injection_markers',
      reason_detail: 'suspicious markup in body',
      classification: { intent: 'payment_confirmation', topic: 'billing', confidence: 0.71 },
      queued_at: hoursAgo(12),
    },
  ];
}

const LOG_STATUSES = ['replied', 'replied', 'replied', 'replied', 'queued', 'replied', 'replied', 'replied', 'queued', 'replied', 'replied', 'failed', 'replied', 'replied', 'replied', 'replied', 'queued', 'replied', 'replied', 'replied', 'replied', 'dismissed', 'replied', 'replied'];
const LOG_SENDERS = [
  'maria.lopez@example.com',
  'juan.garcia@example.com',
  'ana.ramirez@example.com',
  'carlos.m@example.com',
  'laura.f@example.com',
  'pedro.h@example.com',
  'sofia.r@example.com',
  'diego.p@example.com',
  'valeria.c@example.com',
  'roberto.g@example.com',
  'patricia.v@example.com',
  'fernando.n@example.com',
];
const LOG_SUBJECTS = [
  'Cotización seguro de vida',
  'Información plan familiar',
  '¿Cubren gastos médicos?',
  'Renovación de póliza',
  'Consulta sobre becas educativas',
  'Cambio de beneficiario',
  'Fecha de vencimiento',
  'Comprobante de pago',
  '¿Cómo presento un siniestro?',
  'Duda sobre coberturas',
  'Actualización de datos',
  'Solicitar cotización',
];

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getInitialEmailLog() {
  return Array.from({ length: 24 }, (_, i) => {
    const r = seededRandom(i * 7 + 13);
    const rBase = seededRandom(i + 1);
    return {
      id: `log_demo_${String(i + 1).padStart(3, '0')}`,
      sender_email: LOG_SENDERS[i % LOG_SENDERS.length],
      subject: LOG_SUBJECTS[i % LOG_SUBJECTS.length],
      status: LOG_STATUSES[i % LOG_STATUSES.length],
      received_at: hoursAgo(Math.floor(rBase * 72) + 1),
      latency_sec: 6 + r * 22,
      estimated_cost_usd: 0.0018 + r * 0.006,
    };
  });
}

export function getEmailDetailStub(id) {
  return {
    inbound: {
      id,
      sender_name: 'Ana Ramírez',
      sender_email: 'ana.ramirez@example.com',
      subject: 'Cotización seguro de vida',
      received_at: hoursAgo(4),
      status: 'replied',
      body_text:
        'Buenas tardes,\n\nMe gustaría recibir información sobre sus seguros de vida. Tengo 38 años, estoy casada y tenemos dos hijos pequeños. ¿Qué opciones me recomiendan?\n\nSaludos,\nAna',
      classification: { intent: 'inquiry', topic: 'product_selection', confidence: 0.84 },
    },
    queue: null,
    outbound: [
      {
        id: `out_${id}`,
        sent_at: hoursAgo(4),
        source: 'auto',
        body_text:
          'Hola Ana,\n\nGracias por escribirnos. Para un perfil como el tuyo (38 años, familia con hijos pequeños), los planes más recurridos son el Seguro de Vida Individual con cobertura de 2M y el Plan Familiar que cubre a toda la familia en una sola póliza.\n\n¿Quieres que un asesor te contacte para armar una cotización precisa?\n\nSaludos.',
      },
    ],
    rag_chunks: [
      { id: 'chunk_vida_01', content: 'Seguro de Vida Individual — cobertura hasta 2M, pago mensual accesible, sin exámenes médicos para menores de 50.' },
      { id: 'chunk_familiar_02', content: 'Plan Familiar — una sola póliza cubre a padres, cónyuge e hijos. Ideal para familias jóvenes.' },
    ],
  };
}
