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

    // FLUJO PRINCIPAL DE RESPUESTAS
    if (hasNameInMessage && isNewUser) {
      // Usuario nuevo que acaba de decir su nombre
      response = {
        message: `¡Encantado de conocerte, ${detectedName}! 🎉 Ahora que nos conocemos, puedo ayudarte mejor. Tenemos una increíble selección de productos ${tech}: camisetas, sudaderas, stickers, tecnología y tarjetas de regalo. ¿Qué te interesa?`,
        action: null,
        error: null,
        userName: detectedName
      };
    } else if (productRequest && !isNewUser) {
      // Usuario conocido que solicita un producto específico
      response = {
        message: `¡Perfecto, ${userName}! Te ayudo a agregar ${productRequest.productName} a tu carrito. ${productRequest.description}`,
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
        message: `¡Me encanta que estés interesado en ${productRequest.productName}! Pero antes de ayudarte a agregarlo al carrito, **¿podrías decirme tu nombre?** Así puedo personalizar tu experiencia de compra. 😊`,
        action: null,
        error: null,
        userName: userName
      };
    } else if (isNewUser) {
      // Usuario nuevo - flujo normal de onboarding
      if (promptLower.includes('hola') || promptLower.includes('hello') || promptLower.includes('hi')) {
        response = {
          message: `¡Hola! 👋 Bienvenido a nuestra tienda ${tech}. Soy tu asistente personal de compras y me encanta ayudar a encontrar productos perfectos. **¿Cómo te llamas?** Me gustaría personalizar tu experiencia de compra.`,
          action: null,
          error: null,
          userName: userName
        };
      } else {
        response = {
          message: `Me encanta que estés interesado en nuestros productos ${tech}! Pero antes de ayudarte a encontrar lo que buscas, **¿podrías decirme tu nombre?** Así puedo personalizar mis recomendaciones para ti. 😊`,
          action: null,
          error: null,
          userName: userName
        };
      }
    } else {
      // Usuario conocido - flujo normal
      if (promptLower.includes('hola') || promptLower.includes('hello') || promptLower.includes('hi')) {
        response = {
          message: `¡Hola de nuevo, ${userName}! 👋 Me alegra verte. ¿En qué puedo ayudarte hoy? Tengo actualizaciones sobre nuestros productos ${tech} y puedo recomendarte algo específico.`,
          action: null,
          error: null,
          userName: userName
        };
      } else if (promptLower.includes('producto') || promptLower.includes('comprar') || promptLower.includes('recomendar')) {
        response = {
          message: `Perfecto, ${userName}! Te ayudo a encontrar productos ${tech} increíbles. Tenemos:\n\n🎽 **Camisetas y sudaderas** - Cómodas y con diseños únicos\n🏷️ **Stickers** - Para personalizar tus dispositivos\n📱 **Tecnología** - Los últimos dispositivos\n🎁 **Tarjetas regalo** - Perfectas para compartir\n\n¿Qué categoría te interesa más?`,
          action: null,
          error: null,
          userName: userName
        };
      } else if (promptLower.includes('carrito') || promptLower.includes('agregar')) {
        response = {
          message: `¡Excelente elección, ${userName}! Te ayudo a agregar productos a tu carrito. ¿Qué producto específico te gustaría agregar?`,
          action: null,
          error: null,
          userName: userName
        };
      } else {
        response = {
          message: `Entiendo, ${userName}. Recibí tu mensaje: "${prompt}". Como tu asistente personal de compras ${tech}, estoy aquí para ayudarte. ¿Te gustaría ver nuestras recomendaciones o buscas algo específico?`,
          action: null,
          error: null,
          userName: userName
        };
      }
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
