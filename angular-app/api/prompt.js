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

    // FLUJO PARA USUARIOS NUEVOS - Siempre preguntar por el nombre primero
    if (isNewUser) {
      // Si es un saludo inicial, preguntar por el nombre
      if (promptLower.includes('hola') || promptLower.includes('hello') || promptLower.includes('hi')) {
        response = {
          message: `¡Hola! 👋 Bienvenido a nuestra tienda ${tech}. Soy tu asistente personal de compras y me encanta ayudar a encontrar productos perfectos. **¿Cómo te llamas?** Me gustaría personalizar tu experiencia de compra.`,
          action: null,
          error: null,
          userName: userName
        };
      }
      // Si el usuario escribe algo que parece un nombre
      else if (isLikelyName(prompt)) {
        const detectedName = extractName(prompt);
        response = {
          message: `¡Encantado de conocerte, ${detectedName}! 🎉 Ahora que nos conocemos, puedo ayudarte mejor. Tenemos una increíble selección de productos ${tech}: camisetas, sudaderas, stickers, tecnología y tarjetas de regalo. ¿Qué te interesa?`,
          action: null,
          error: null,
          userName: detectedName
        };
      }
      // Si el usuario hace preguntas pero no ha dado su nombre
      else {
        response = {
          message: `Me encanta que estés interesado en nuestros productos ${tech}! Pero antes de ayudarte a encontrar lo que buscas, **¿podrías decirme tu nombre?** Así puedo personalizar mis recomendaciones para ti. 😊`,
          action: null,
          error: null,
          userName: userName
        };
      }
    }
    // FLUJO PARA USUARIOS CON NOMBRE CONOCIDO
    else {
      // Análisis del prompt para usuarios con nombre
      if (promptLower.includes('hola') || promptLower.includes('hello') || promptLower.includes('hi')) {
        response = {
          message: `¡Hola de nuevo, ${userName}! 👋 Me alegra verte. ¿En qué puedo ayudarte hoy? Tengo actualizaciones sobre nuestros productos ${tech} y puedo recomendarte algo específico.`,
          action: null,
          error: null,
          userName: userName
        };
      } else if (promptLower.includes('producto') || promptLower.includes('comprar') || promptLower.includes('recomendar') || promptLower.includes('camiseta') || promptLower.includes('tienes')) {
        response = {
          message: `Perfecto, ${userName}! Te ayudo a encontrar productos ${tech} increíbles. Tenemos:\n\n🎽 **Camisetas y sudaderas** - Cómodas y con diseños únicos\n🏷️ **Stickers** - Para personalizar tus dispositivos\n📱 **Tecnología** - Los últimos dispositivos\n🎁 **Tarjetas regalo** - Perfectas para compartir\n\n¿Qué categoría te interesa más?`,
          action: null,
          error: null,
          userName: userName
        };
      } else if (promptLower.includes('carrito') || promptLower.includes('agregar') || promptLower.includes('comprar')) {
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

// Función para detectar si un mensaje parece un nombre
function isLikelyName(message) {
  const namePatterns = [
    /^(me llamo|mi nombre es|soy|i am|my name is|i'm)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{1,20})$/i,
    /^([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]{2,15})$/i, // Nombre simple
  ];

  for (const pattern of namePatterns) {
    if (pattern.test(message.trim())) {
      return true;
    }
  }
  return false;
}

// Función para extraer el nombre del mensaje
function extractName(message) {
  const namePatterns = [
    /(?:me llamo|mi nombre es|soy|i am|my name is|i'm)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{1,20})/i,
    /^([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]{2,15})$/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.trim().match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();

      // Filtrar palabras comunes
      const commonWords = [
        'hola', 'hello', 'gracias', 'thanks', 'bien', 'good', 'mal', 'bad',
        'si', 'no', 'yes', 'usuario', 'ayuda', 'help', 'producto', 'productos',
        'comprar', 'precio', 'caro', 'barato', 'angular', 'react'
      ];

      if (!commonWords.includes(name.toLowerCase()) && name.length >= 2) {
        return name;
      }
    }
  }
  return message.trim(); // Fallback al mensaje completo si no hay patrón específico
}
