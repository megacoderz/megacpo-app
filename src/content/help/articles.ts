const articles = {
  'como-voce-ganha': {
    title: {
      'pt-BR': 'Como você ganha',
      'en-US': 'How you earn',
      'es-ES': 'Cómo gana',
    },
    summary: {
      'pt-BR': 'Seu % sobre o líquido do CPO após taxas da plataforma.',
      'en-US': 'Your % of CPO net after platform fees.',
      'es-ES': 'Su % sobre el neto del CPO tras tasas de la plataforma.',
    },
    body: {
      'pt-BR': [
        'O CPO define se você é sócio de um posto ou investidor do tenant e qual percentual recebe.',
        'A base é o líquido do CPO: valor da sessão menos royalty e taxa estimada do meio de pagamento. Mensalidade SaaS e taxa de ativação do motorista não entram no seu rateio.',
        'Exemplo ilustrativo: líquido R$ 91,60 e você com 20% → cerca de R$ 18,32 (centavos arredondados a favor do CPO).',
        'Sem Connect pronto, você não recebe e o CPO pode ficar bloqueado para iniciar sessões.',
      ],
      'en-US': [
        'The CPO sets whether you are a station partner or tenant investor and your percentage.',
        'The base is CPO net: session amount minus royalty and estimated payment-method fee. SaaS subscription and driver activation fee are outside your split.',
        'Illustrative example: R$91.60 net and 20% → about R$18.32 (cents floor in favor of the CPO).',
        'Without ready Connect you are not paid and the CPO may be blocked from starting sessions.',
      ],
      'es-ES': [
        'El CPO define si usted es socio de estación o inversor y su porcentaje.',
        'La base es el neto del CPO tras royalty y tasa estimada. Mensualidad y activación no entran en su reparto.',
        'Ejemplo: neto R$91,60 y 20% → cerca de R$18,32.',
        'Sin Connect listo no cobra y el CPO puede quedar bloqueado.',
      ],
    },
    faqs: {
      'pt-BR': [
        {
          q: '% sobre bruto?',
          a: 'Não — sobre o líquido do CPO.',
        },
      ],
      'en-US': [
        {
          q: '% of gross?',
          a: 'No — of CPO net.',
        },
      ],
      'es-ES': [
        {
          q: '¿% sobre bruto?',
          a: 'No — sobre el neto del CPO.',
        },
      ],
    },
  },
  'stripe-connect': {
    title: {
      'pt-BR': 'Stripe Connect',
      'en-US': 'Stripe Connect',
      'es-ES': 'Stripe Connect',
    },
    summary: {
      'pt-BR': 'Conclua o cadastro Express para receber repasses.',
      'en-US': 'Finish Express onboarding to receive payouts.',
      'es-ES': 'Complete Express para recibir pagos.',
    },
    body: {
      'pt-BR': [
        'Use o botão de conectar no app ou no portal web /partner.',
        'Envie os documentos pedidos pela Stripe até charges enabled.',
        'Se o link expirar, peça reenvio ao CPO.',
      ],
      'en-US': [
        'Use the connect button in the app or /partner web portal.',
        'Submit Stripe documents until charges enabled.',
        'If the link expires, ask the CPO to resend.',
      ],
      'es-ES': [
        'Use el botón de conectar en la app o en /partner.',
        'Envíe documentos hasta charges enabled.',
        'Si el link expira, pida reenvío al CPO.',
      ],
    },
    faqs: {
      'pt-BR': [
        {
          q: 'Por que bloqueia o CPO?',
          a: 'Split ativo exige sua conta pronta na liquidação.',
        },
      ],
      'en-US': [
        {
          q: 'Why block the CPO?',
          a: 'Active split needs your account ready at settlement.',
        },
      ],
      'es-ES': [
        {
          q: '¿Por qué bloquea al CPO?',
          a: 'El split activo exige su cuenta lista.',
        },
      ],
    },
  },
  extrato: {
    title: {
      'pt-BR': 'Extrato',
      'en-US': 'Statement',
      'es-ES': 'Extracto',
    },
    summary: {
      'pt-BR': 'Período, totais e exportação CSV.',
      'en-US': 'Period, totals and CSV export.',
      'es-ES': 'Período, totales y exportación CSV.',
    },
    body: {
      'pt-BR': [
        'Filtre o período no app ou no portal web.',
        'Exporte CSV para sua contabilidade. Não há NF-e automática da plataforma no MVP.',
        'Dúvidas de %: fale com o CPO. Dúvidas de app/Connect: suporte da plataforma.',
      ],
      'en-US': [
        'Filter the period in the app or web portal.',
        'Export CSV for accounting. No automatic NF-e from the platform in the MVP.',
        '% questions: talk to the CPO. App/Connect questions: platform support.',
      ],
      'es-ES': [
        'Filtre el período en la app o portal.',
        'Exporte CSV para contabilidad. No hay NF-e automática en el MVP.',
        'Dudas de %: CPO. Dudas de app/Connect: soporte de plataforma.',
      ],
    },
    faqs: {
      'pt-BR': [
        {
          q: 'CSV tem PII de motorista?',
          a: 'Não deve — é extrato do sócio.',
        },
      ],
      'en-US': [
        {
          q: 'CSV has driver PII?',
          a: 'It should not — partner statement only.',
        },
      ],
      'es-ES': [
        {
          q: '¿CSV con PII del conductor?',
          a: 'No debe — extracto del socio.',
        },
      ],
    },
  },
} as const
export default articles
