import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';
import { data } from "../data";
import { addToCartTool, addToCartToolFn } from './add-to-cart';

require('dotenv').config();

// configure a Genkit instance
const ai = genkit({
  plugins: [googleAI()],
});

const tool = ai.defineTool(addToCartTool, addToCartToolFn);

interface UserProfile {
  name: string;
  isNewUser: boolean;
  conversationCount: number;
}

interface AIResponse {
  message: string;
  action?: {
    type: string;
    params: {
      id: string;
      quantity: number;
    };
  };
  error?: string;
  userName?: string; // Nuevo campo para detectar nombres
}

function detectLanguage(text: string): 'es' | 'en' {
  // Palabras clave en español - más específicas
  const spanishKeywords = [
    'hola', 'tienes', 'quiero', 'necesito', 'busco', 'puedes', 'ayuda', 'agregar',
    'carrito', 'productos', 'camiseta', 'camisetas', 'precio', 'cuánto', 'dónde', 'cómo',
    'gracias', 'por favor', 'sí', 'si', 'no', 'también', 'más', 'menos', 'angular',
    'que', 'tienes', 'hay', 'disponible', 'vendes', 'venden'
  ];

  const text_lower = text.toLowerCase().trim();
  console.log('🔍 Language detection for:', text_lower);

  const hasSpanishWords = spanishKeywords.some(word => text_lower.includes(word));
  console.log('🔍 Spanish keywords found:', hasSpanishWords);

  // Si es solo un nombre, mantener el idioma previo o usar español por defecto
  if (text_lower.length <= 15 && /^[a-záéíóúñ]+$/i.test(text_lower)) {
    console.log('🔍 Detected name only, defaulting to Spanish');
    return 'es';
  }

  const result = hasSpanishWords ? 'es' : 'en';
  console.log('🔍 Final language detection:', result);
  return result;
}

function detectNameInMessage(message: string): string | null {
  console.log('🔍 Detecting name in message:', message);

  // Patrones para detectar nombres en respuestas como "Mi nombre es Juan" o "Soy María"
  const namePatterns = [
    /(?:mi nombre es|me llamo|soy|i am|my name is|i'm)\s+([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]{1,20})/i,
    /^([a-záéíóúñA-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ]{2,15})$/i, // Nombre simple de una palabra
    /^([a-z][a-z]{2,15})$/i, // Patrón adicional para nombres sin acentos
  ];

  for (const pattern of namePatterns) {
    const match = message.trim().match(pattern);
    if (match && match[1]) {
      const detectedName = match[1].trim();
      console.log('✅ Name pattern matched:', detectedName);

      // Validar que no sea una palabra común
      const commonWords = ['hola', 'hello', 'gracias', 'thanks', 'bien', 'good', 'mal', 'bad', 'usuario'];
      if (!commonWords.includes(detectedName.toLowerCase()) && detectedName.length >= 2) {
        console.log('📝 Valid name detected:', detectedName);
        return detectedName;
      } else {
        console.log('❌ Name rejected (common word):', detectedName);
      }
    }
  }

  console.log('❌ No name detected in message');
  return null;
}

export async function promptModel(prompt: string, name: string, tech: 'angular' | 'react', userProfile: UserProfile): Promise<AIResponse> {
  const language = detectLanguage(prompt);
  const userInput = prompt.toLowerCase().trim();

  // Detectar si el usuario dijo su nombre ANTES de procesar
  const detectedName = detectNameInMessage(prompt);
  console.log('🔍 Name detection result:', detectedName);

  // Si detectamos un nombre y es usuario nuevo, cambiar inmediatamente el comportamiento
  let effectiveUserProfile = { ...userProfile };
  if (detectedName && userProfile.isNewUser) {
    console.log('🎯 Name detected for new user, switching to known user behavior');
    effectiveUserProfile = {
      ...userProfile,
      name: detectedName,
      isNewUser: false,
      conversationCount: userProfile.conversationCount + 1
    };
  }

  // Obtener productos disponibles con sus IDs reales
  const availableProducts = data[tech].products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category_ids[0] || 'general'
  }));

  const productsList = availableProducts.map(product =>
    `${product.id}: ${product.name}`
  ).join('\n');

  // Detectar si DEFINITIVAMENTE debe usar la herramienta
  const shouldUseAddToCart = (
    userInput.includes('sí') ||
    userInput.includes('si') ||
    userInput.includes('yes') ||
    userInput.includes('agregar') ||
    userInput.includes('añadir') ||
    userInput.includes('comprar') ||
    userInput.includes('quiero') ||
    userInput.includes('add')
  );

  // Construir prompt según si es usuario nuevo o conocido
  let basePrompt = '';

  if (effectiveUserProfile.isNewUser && !detectedName) {
    // Usuario nuevo sin nombre detectado - preguntar por el nombre
    basePrompt = language === 'es' ? `
INSTRUCCIÓN CRÍTICA: DEBES responder ÚNICAMENTE en ESPAÑOL. No uses inglés bajo ninguna circunstancia.

Eres un asistente de ecommerce amigable. SIEMPRE habla en español.

IMPORTANTE: Es la primera vez que hablas con este usuario.
1. Salúdalo de manera amigable
2. Pregúntale su nombre inmediatamente
3. No menciones productos hasta saber su nombre

Ejemplo: "¡Hola! Bienvenido a nuestra tienda. Para brindarte una mejor experiencia, ¿podrías decirme tu nombre?"

RECUERDA: RESPONDE SOLO EN ESPAÑOL.` : `
CRITICAL INSTRUCTION: You MUST respond ONLY in ENGLISH. Do not use Spanish under any circumstance.

You are a friendly ecommerce assistant. ALWAYS speak in English.

IMPORTANT: This is the first time talking to this user.
1. Greet them warmly
2. Ask for their name immediately
3. Don't mention products until you know their name

Example: "Hello! Welcome to our store. To give you a better experience, could you tell me your name?"

REMEMBER: RESPOND ONLY IN ENGLISH.`;
  } else {
    // Usuario conocido o acabamos de detectar el nombre - comportamiento normal
    const userNameToUse = detectedName || effectiveUserProfile.name || name || 'Usuario';

    basePrompt = language === 'es' ? `
INSTRUCCIÓN CRÍTICA: DEBES responder ÚNICAMENTE en ESPAÑOL. No uses inglés bajo ninguna circunstancia.

Eres un asistente de ecommerce. SIEMPRE habla en español.

REGLA CRÍTICA: Si el usuario dice "sí", "si", "agregar", "quiero", o similares, DEBES usar la herramienta add-to-cart.

${shouldUseAddToCart ? 'ATENCIÓN: El usuario quiere agregar algo. USA LA HERRAMIENTA add-to-cart AHORA.' : ''}

${detectedName ? `IMPORTANTE: El usuario acaba de decir que su nombre es ${detectedName}. Salúdalo por su nombre y pregunta en qué puedes ayudarlo.` : ''}

Productos:
${productsList}

Para Angular T-shirt usa: id="6631", productName="Angular T-shirt"

Usuario: ${userNameToUse}
RECUERDA: RESPONDE SOLO EN ESPAÑOL.` : `
CRITICAL INSTRUCTION: You MUST respond ONLY in ENGLISH. Do not use Spanish under any circumstance.

You are an ecommerce assistant. ALWAYS speak in English.

CRITICAL RULE: If user says "yes", "add", "buy", "want", you MUST use add-to-cart tool.

${shouldUseAddToCart ? 'ATTENTION: User wants to add something. USE THE add-to-cart TOOL NOW.' : ''}

${detectedName ? `IMPORTANT: User just said their name is ${detectedName}. Greet them by name and ask how you can help.` : ''}

Products:
${productsList}

For Angular T-shirt use: id="6631", productName="Angular T-shirt"

User: ${userNameToUse}
REMEMBER: RESPOND ONLY IN ENGLISH.`;
  }

  try {
    console.log('🤖 Sending prompt to AI...');
    console.log('🎯 Should use add-to-cart:', shouldUseAddToCart);
    console.log('🗣️ Detected language:', language);
    console.log('👤 Effective user profile:', effectiveUserProfile);

    const { text, toolRequests } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `${basePrompt}\n\nUser: ${prompt}`,
      tools: effectiveUserProfile.isNewUser ? [] : [tool], // No tools para usuarios nuevos sin nombre
      returnToolRequests: true,
      config: {
        temperature: shouldUseAddToCart ? 0.0 : 0.1,
        maxOutputTokens: 200
      }
    });

    console.log(`📊 AI returned ${toolRequests.length} tool requests`);

    if (toolRequests.length === 0) {
      // Si debería usar herramienta pero no la usó (y no es usuario nuevo), forzar respuesta con herramienta
      if (shouldUseAddToCart && !effectiveUserProfile.isNewUser) {
        console.log('🚨 FORCING add-to-cart because user said yes/sí');

        // Encontrar Angular T-shirt por defecto
        const angularTshirt = availableProducts.find(p => p.name.includes('Angular T-shirt'));
        if (angularTshirt) {
          const forceMessage = language === 'es'
            ? `¡Perfecto! Agregando 1 x Angular T-shirt al carrito.`
            : `Perfect! Adding 1 x Angular T-shirt to cart.`;

          return {
            message: forceMessage,
            action: {
              type: 'addToCart',
              params: {
                id: angularTshirt.id,
                quantity: 1,
              }
            },
            userName: detectedName || undefined
          };
        }
      }

      console.log('ℹ️ No tool requests, returning text response');
      console.log('💬 AI text response:', text);

      return {
        message: text,
        userName: detectedName || undefined
      };
    }

    console.log('🔧 Processing tool request...');
    const { toolRequest } = toolRequests[0];
    console.log('🔍 Tool request input:', JSON.stringify(toolRequest.input, null, 2));

    const { id, quantity, productName } = toolRequest.input as { id: string, quantity: number, productName: string };

    console.log(`🎯 AI quiere agregar: ID ${id}, Cantidad: ${quantity}, Producto: ${productName}`);

    // Validar que el ID existe
    const productExists = availableProducts.find(p => p.id === id);
    if (!productExists) {
      console.error(`❌ ID inválido: ${id}`);
      const errorMessage = language === 'es'
        ? `Producto no encontrado. Productos disponibles: ${availableProducts.map(p => p.name).join(', ')}`
        : `Product not found. Available: ${availableProducts.map(p => p.name).join(', ')}`;

      return {
        message: errorMessage,
        userName: detectedName || undefined
      };
    }

    const successMessage = language === 'es'
      ? `¡Perfecto! Agregando ${quantity} x ${productName} al carrito.`
      : `Perfect! Adding ${quantity} x ${productName} to cart.`;

    console.log('✅ ID válido, creando acción');

    return {
      message: successMessage,
      action: {
        type: 'addToCart',
        params: {
          id: id,
          quantity: quantity,
        }
      },
      userName: detectedName || undefined
    };
  } catch (error) {
    console.error('❌ Error en AI:', error);

    // Manejar error 503 específicamente
    if (error && typeof error === 'object' && 'status' in error && error.status === 503) {
      const retryMessage = language === 'es'
        ? 'El modelo de IA está temporalmente sobrecargado. Por favor, inténtalo de nuevo en unos segundos.'
        : 'The AI model is temporarily overloaded. Please try again in a few seconds.';

      return {
        message: retryMessage,
        error: 'RATE_LIMITED'
      };
    }

    // Error genérico
    const errorMessage = language === 'es'
      ? 'Lo siento, hubo un problema procesando tu solicitud. Por favor, inténtalo de nuevo.'
      : 'Sorry, there was a problem processing your request. Please try again.';

    return {
      message: errorMessage,
      error: 'UNKNOWN'
    };
  }
}
