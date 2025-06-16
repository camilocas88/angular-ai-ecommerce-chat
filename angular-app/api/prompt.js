// Simple response for basic deployment
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, tech, name } = req.query;

    if (!prompt || !tech) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['prompt', 'tech']
      });
    }

    // Determinar si es usuario nuevo basado en el nombre
    const userName = name || 'Usuario';
    const isNewUser = !name || name === 'Usuario';

    console.log('🤖 [API] Processing prompt:', {
      prompt,
      userName,
      isNewUser,
      tech
    });

    let response;
    const promptLower = prompt.toLowerCase().trim();

    // PRIMERA PRIORIDAD: Detectar nombres en el mensaje
    const detectedName = extractName(prompt);
    const hasNameInMessage = detectedName && detectedName !== 'Usuario' && detectedName.length > 1;

    // SEGUNDA PRIORIDAD: Detectar solicitudes de productos específicos
    const productRequest = detectProductRequest(prompt, tech);

    // DETECTAR INTENCIÓN DEL USUARIO
    const userIntent = analyzeUserIntent(prompt, isNewUser);

    // FLUJO PRINCIPAL DE RESPUESTAS
    if (hasNameInMessage && isNewUser) {
      // Usuario nuevo que acaba de decir su nombre
      response = {
        message: `¡Encantado de conocerte, ${detectedName}! 🎉 Me alegra mucho poder ayudarte personalmente. Veo que estás interesado en productos ${tech} - tengo algunas recomendaciones increíbles para ti. ¿Te gustaría que te muestre nuestros productos más populares o tienes algo específico en mente?`,
        action: null,
        error: null,
        userName: detectedName
      };
    } else if (productRequest && !isNewUser) {
      // Usuario conocido que solicita un producto específico
      const enthusiasm = getEnthusiasticResponse();
      response = {
        message: `${enthusiasm} ${userName}! Excelente elección con ${productRequest.productName}. ${productRequest.description} ¡Te lo agrego al carrito ahora mismo! 🛒`,
        action: {
          type: 'add_to_cart',
          params: {
            productId: productRequest.productId,
            productName: productRequest.productName,
            quantity: 1
          }
        },
        error: null,
        userName: userName
      };
    } else if (productRequest && isNewUser) {
      // Usuario nuevo que solicita productos pero necesitamos su nombre primero
      response = {
        message: `¡Wow! Tienes muy buen ojo para elegir - ${productRequest.productName} es uno de nuestros favoritos 😍 Antes de agregarlo a tu carrito, me gustaría conocerte mejor. **¿Cuál es tu nombre?** Así puedo hacer que tu experiencia sea perfecta.`,
        action: null,
        error: null,
        userName: userName
      };
    } else if (isNewUser) {
      // Usuario nuevo - flujo de onboarding más natural
      response = handleNewUserResponse(prompt, userIntent, tech);
    } else {
      // Usuario conocido - respuestas conversacionales inteligentes
      response = handleKnownUserResponse(prompt, userIntent, userName, tech);
    }

    console.log('🤖 [API] Sending response:', response);
    return res.json(response);

  } catch (error) {
    console.error('❌ Error in /api/prompt:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Función para analizar la intención del usuario
function analyzeUserIntent(prompt, isNewUser) {
  const promptLower = prompt.toLowerCase().trim();

  // Intenciones específicas
  if (promptLower.includes('hola') || promptLower.includes('hello') || promptLower.includes('hi')) {
    return 'greeting';
  }

  if (promptLower.includes('gracias') || promptLower.includes('thanks')) {
    return 'thanks';
  }

  if (promptLower.includes('ayuda') || promptLower.includes('help')) {
    return 'help';
  }

  if (promptLower.includes('precio') || promptLower.includes('costo') || promptLower.includes('cuanto')) {
    return 'price_inquiry';
  }

  if (promptLower.includes('recomendar') || promptLower.includes('sugerir') || promptLower.includes('mejor')) {
    return 'recommendation';
  }

  if (promptLower.includes('carrito') || promptLower.includes('comprar') || promptLower.includes('buy')) {
    return 'purchase';
  }

  if (promptLower.includes('si') || promptLower.includes('ok') || promptLower.includes('bien')) {
    return 'affirmation';
  }

  if (promptLower.includes('no') || promptLower.includes('nada')) {
    return 'negation';
  }

  if (promptLower.length < 5) {
    return 'short_response';
  }

  return 'general';
}

// Manejo de usuarios nuevos
function handleNewUserResponse(prompt, intent, tech) {
  const responses = {
    greeting: `¡Hola! 👋 Qué gusto tenerte aquí en nuestra tienda ${tech}. Soy tu asistente personal de compras y estoy súper emocionado de ayudarte a encontrar productos increíbles. **¿Cómo te llamas?** Me encanta conocer a nuestros clientes 😊`,

    help: `¡Por supuesto que te ayudo! 🤝 Soy tu guía personal para encontrar los mejores productos ${tech}. Pero primero, **¿me dices tu nombre?** Así puedo personalizar completamente mi ayuda para ti.`,

    general: `¡Bienvenido a nuestra increíble tienda ${tech}! 🎉 Me encanta que estés aquí explorando. Soy tu asistente personal y tengo muchas cosas geniales que mostrarte. **¿Cuál es tu nombre?** Me gustaría conocerte mejor para ayudarte perfectamente.`
  };

  const message = responses[intent] || responses.general;

  return {
    message,
    action: null,
    error: null,
    userName: 'Usuario'
  };
}

// Manejo de usuarios conocidos
function handleKnownUserResponse(prompt, intent, userName, tech) {
  const responses = {
    greeting: [
      `¡Hola de nuevo, ${userName}! 🌟 Me alegra mucho verte otra vez. ¿Listo para descubrir más productos ${tech} increíbles?`,
      `¡Hey ${userName}! 👋 Qué bueno que volviste. ¿En qué nueva aventura de compras te puedo ayudar hoy?`,
      `¡${userName}! 🎉 Me encanta que estés de vuelta. Tengo algunas novedades ${tech} que te van a fascinar.`
    ],

    thanks: [
      `¡De nada, ${userName}! 😊 Me encanta ayudarte. ¿Hay algo más en lo que pueda asistirte?`,
      `¡Un placer, ${userName}! 🌟 Siempre estoy aquí para ti. ¿Qué más podemos explorar juntos?`,
      `¡Para eso estoy aquí, ${userName}! 💪 ¿Te gustaría ver más productos o necesitas ayuda con algo específico?`
    ],

    affirmation: [
      `¡Perfecto, ${userName}! 🎯 Me encanta tu actitud positiva. ¿Te muestro algunas opciones increíbles?`,
      `¡Genial, ${userName}! 🚀 Estoy emocionado de ayudarte. ¿Qué tipo de productos ${tech} te interesan más?`,
      `¡Excelente, ${userName}! ✨ Vamos a encontrar algo perfecto para ti. ¿Prefieres ver camisetas, tech o stickers?`
    ],

    help: [
      `¡Claro que sí, ${userName}! 🤝 Estoy aquí para ayudarte con todo lo que necesites. ¿Buscas algo específico o quieres que te muestre nuestros mejores productos ${tech}?`,
      `¡Por supuesto, ${userName}! 💡 Soy tu experto en productos ${tech}. ¿Te ayudo a encontrar algo en particular?`
    ],

    recommendation: [
      `¡Me encanta hacer recomendaciones, ${userName}! 🌟 Para productos ${tech}, te sugiero nuestras camisetas súper cómodas, stickers geniales para personalizar tus dispositivos, o nuestros productos tech más innovadores. ¿Qué categoría te llama más la atención?`,
      `¡Excelente pregunta, ${userName}! 🎯 Basándome en lo que más gusta a nuestros clientes ${tech}, te recomiendo: camisetas de calidad premium, stickers únicos, o nuestra línea de tecnología. ¿Por dónde empezamos?`
    ],

    price_inquiry: [
      `¡Buena pregunta, ${userName}! 💰 Nuestros productos ${tech} tienen precios súper accesibles. Las camisetas desde $25, stickers desde $5, y tenemos opciones tech para todos los presupuestos. ¿Qué producto específico te interesa?`,
      `¡Hablemos de precios, ${userName}! 📊 Tenemos opciones para todos los presupuestos en productos ${tech}. ¿Hay algo específico que quieres saber el precio?`
    ],

    short_response: [
      `Entiendo, ${userName}! 🤔 ¿Te gustaría que te muestre algunas opciones increíbles de productos ${tech}?`,
      `¡Perfecto, ${userName}! 😊 ¿Qué tal si exploramos juntos nuestro catálogo ${tech}?`,
      `¡Dale, ${userName}! 🚀 ¿Te muestro nuestros productos más populares?`
    ],

    general: [
      `¡Interesante, ${userName}! 🤔 Me gusta tu curiosidad. ¿Te gustaría ver nuestros productos ${tech} más nuevos o prefieres que te muestre los clásicos favoritos?`,
      `¡Entiendo, ${userName}! 💡 Cuéntame más sobre lo que tienes en mente, o si prefieres, puedo mostrarte algunas opciones geniales.`,
      `¡Claro, ${userName}! 🎯 ¿Te gustaría que te ayude a encontrar algo específico o prefieres que te muestre nuestras mejores opciones ${tech}?`
    ]
  };

  const intentResponses = responses[intent] || responses.general;
  const message = Array.isArray(intentResponses)
    ? intentResponses[Math.floor(Math.random() * intentResponses.length)]
    : intentResponses;

  return {
    message,
    action: null,
    error: null,
    userName: userName
  };
}

// Obtener respuesta entusiasta aleatoria
function getEnthusiasticResponse() {
  const responses = [
    '¡Increíble elección,',
    '¡Perfecto,',
    '¡Excelente gusto,',
    '¡Genial,',
    '¡Fantástico,',
    '¡Súper,',
    '¡Wow,'
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Función para detectar solicitudes de productos específicos
function detectProductRequest(prompt, tech) {
  const promptLower = prompt.toLowerCase().trim();

  // Productos de Angular disponibles
  const angularProducts = [
    { id: '6631', name: 'Angular T-shirt', keywords: ['camiseta', 'camisa', 'tshirt', 't-shirt', 'playera'] },
    { id: '2372', name: 'Angular Sweatshirt', keywords: ['sudadera', 'sweatshirt', 'sueter'] },
    { id: '3936', name: 'Angular Stickers', keywords: ['sticker', 'stickers', 'pegatina', 'pegatinas', 'calcomanias'] },
    { id: '1002', name: 'Angular Mug', keywords: ['taza', 'mug', 'vaso'] },
    { id: '5551', name: 'Pixel 8 Pro', keywords: ['pixel', 'telefono', 'celular', 'smartphone'] }
  ];

  // Productos de React disponibles
  const reactProducts = [
    { id: 'react-001', name: 'React T-shirt', keywords: ['camiseta', 'camisa', 'tshirt', 't-shirt', 'playera'] },
    { id: 'react-002', name: 'React Sweatshirt', keywords: ['sudadera', 'sweatshirt', 'sueter'] },
    { id: 'react-003', name: 'React Stickers', keywords: ['sticker', 'stickers', 'pegatina', 'pegatinas'] },
    { id: 'react-004', name: 'React Mug', keywords: ['taza', 'mug', 'vaso'] }
  ];

  const products = tech === 'react' ? reactProducts : angularProducts;

  // Buscar coincidencias de productos
  for (const product of products) {
    for (const keyword of product.keywords) {
      if (promptLower.includes(keyword)) {
        // Verificar que también mencione la tecnología
        const mentionsTech = promptLower.includes(tech.toLowerCase()) ||
                            promptLower.includes('de ' + tech.toLowerCase()) ||
                            promptLower.includes(tech.toLowerCase() + ' ');

        if (mentionsTech || tech === 'angular') { // Para Angular, asumir si no especifica
          return {
            productId: product.id,
            productName: product.name,
            description: `Es un excelente producto ${tech} que te va a encantar.`
          };
        }
      }
    }
  }

  return null;
}

// Función mejorada para extraer nombres del mensaje
function extractName(message) {
  const namePatterns = [
    // Patrones explícitos
    /(?:me llamo|mi nombre es|soy|i am|my name is|i'm)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{1,20})/i,
    // Patrones simples (solo nombres)
    /^([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]{2,15})$/i,
    // Patrón para "hola me llamo X"
    /hola\s+me\s+llamo\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]{1,15})/i,
    // Patrón para solo el nombre al principio
    /^([a-záéíóúñA-ZÁÉÍÓÚÑ]{3,15})$/i
  ];

  for (const pattern of namePatterns) {
    const match = message.trim().match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();

      // Lista de palabras a evitar
      const commonWords = [
        'hola', 'hello', 'gracias', 'thanks', 'bien', 'good', 'mal', 'bad',
        'si', 'no', 'yes', 'usuario', 'ayuda', 'help', 'producto', 'productos',
        'comprar', 'precio', 'caro', 'barato', 'angular', 'react', 'camiseta',
        'camisa', 'sudadera', 'sticker', 'taza', 'mug', 'telefono', 'celular'
      ];

      if (!commonWords.includes(name.toLowerCase()) && name.length >= 2) {
        return name;
      }
    }
  }

  return null;
}
