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

    // Respuesta personalizada basada en el prompt
    const userName = name || 'Usuario';
    let response;

    // Análisis básico del prompt para dar respuestas más relevantes
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('hola') || promptLower.includes('hello') || promptLower.includes('hi')) {
      response = {
        message: `¡Hola ${userName}! 👋 Soy tu asistente de compras especializado en ${tech}. ¿En qué puedo ayudarte hoy? Puedo recomendarte productos, ayudarte a encontrar algo específico o responder preguntas sobre nuestro catálogo.`,
        action: null,
        error: null,
        userName: userName
      };
    } else if (promptLower.includes('producto') || promptLower.includes('comprar') || promptLower.includes('recomendar')) {
      response = {
        message: `Perfecto, ${userName}! Te puedo ayudar a encontrar productos ${tech} increíbles. ¿Buscas algo específico como camisetas, stickers, tecnología, o tarjetas de regalo?`,
        action: null,
        error: null,
        userName: userName
      };
    } else if (promptLower.includes('carrito') || promptLower.includes('agregar')) {
      response = {
        message: `¡Excelente elección, ${userName}! Te ayudo a agregar productos a tu carrito. ¿Qué producto te interesa?`,
        action: null,
        error: null,
        userName: userName
      };
    } else {
      response = {
        message: `Entiendo, ${userName}. Recibí tu mensaje: "${prompt}". Como asistente de compras ${tech}, estoy aquí para ayudarte a encontrar productos perfectos para ti. ¿Te gustaría ver nuestras recomendaciones o buscas algo específico?`,
        action: null,
        error: null,
        userName: userName
      };
    }

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
