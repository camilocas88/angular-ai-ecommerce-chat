import { addToCartTool, addToCartToolFn } from './add-to-cart';
import { createAIInstance } from './ai-config';
import {
  AIResponse,
  TechStack,
  UserPromptSchema
} from './types';
import {
  AILogger,
  ProductUtils,
  PromptBuilder,
  createAIError,
  measureTime,
  validateInput
} from './utils';

// Instancia del logger
const logger = AILogger.getInstance();

// Cache para respuestas (simple implementación)
const responseCache = new Map<string, AIResponse>();

// Configurar AI instance y herramientas
let aiInstance: any;
let tool: any;

try {
  aiInstance = createAIInstance({
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxTokens: 1000
  });

  // Definir herramientas
  tool = aiInstance.defineTool(addToCartTool, addToCartToolFn);

  logger.info('Sistema de AI inicializado correctamente');
} catch (error) {
  logger.error('Error inicializando sistema de AI', error);
  throw error;
}

/**
 * Genera una clave para el cache basada en los parámetros
 */
function generateCacheKey(prompt: string, name: string, tech: TechStack): string {
  return `${tech}:${name}:${prompt.toLowerCase().slice(0, 50)}`.replace(/\s+/g, '-');
}

/**
 * Función principal mejorada para procesar prompts
 */
export async function promptModelImproved(
  prompt: string,
  name: string,
  tech: TechStack
): Promise<AIResponse> {
  const startTime = Date.now();

  try {
    // 1. Validar entrada
    const input = validateInput(
      { prompt, name, tech },
      UserPromptSchema,
      'Parámetros de entrada inválidos'
    );

    logger.debug('Procesando prompt', { prompt: prompt.slice(0, 100), name, tech });

    // 2. Verificar cache
    const cacheKey = generateCacheKey(input.prompt, input.name, input.tech);
    if (responseCache.has(cacheKey)) {
      logger.debug('Respuesta obtenida del cache');
      const cachedResponse = responseCache.get(cacheKey)!;
      // Actualizar tiempo de procesamiento para respuestas cacheadas
      if (cachedResponse.metadata) {
        cachedResponse.metadata.processingTime = Date.now() - startTime;
      }
      return cachedResponse;
    }

    // 3. Construir prompt mejorado
    const promptBuilder = new PromptBuilder()
      .setUserContext(input.name)
      .addInstruction('Puedes ayudar al usuario agregando productos al carrito')
      .addInstruction('No muestres IDs de productos, solo nombres y categorías')
      .addInstruction('Sé amigable y útil en tus respuestas')
      .addInstruction('Si el usuario busca algo específico, sugiere productos relevantes')
      .setProducts(input.tech);

    const fullPrompt = promptBuilder.build(input.prompt);

    // 4. Procesar con AI
    const { result: aiResult, duration } = await measureTime(async () => {
      const { text, toolRequests } = await aiInstance.generate({
        prompt: fullPrompt,
        tools: [tool],
        returnToolRequests: true,
        config: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      });

      return { text, toolRequests };
    });

    // 5. Procesar respuesta
    let response: AIResponse;

    if (aiResult.toolRequests.length === 0) {
      // Respuesta de texto simple
      response = {
        message: aiResult.text,
        metadata: {
          model: 'gemini-2.0-flash',
          timestamp: new Date(),
          processingTime: duration
        }
      };
    } else {
      // Respuesta con acción
      const { toolRequest } = aiResult.toolRequests[0];
      const { id, quantity, productName } = toolRequest.input as {
        id: string;
        quantity: number;
        productName: string;
      };

      // Validar que el producto existe
      const product = ProductUtils.findProduct(input.tech, id);
      if (!product) {
        throw createAIError(
          'INVALID_INPUT',
          `Producto con ID ${id} no encontrado`,
          { productId: id }
        );
      }

      response = {
        message: `Perfecto! Agregando ${quantity} unidad(es) de "${productName}" al carrito.`,
        action: {
          type: 'addToCart',
          params: {
            id: id,
            quantity: quantity,
            productName: productName,
            price: product.discount_price > 0 ? product.discount_price : product.price
          }
        },
        metadata: {
          model: 'gemini-2.0-flash',
          timestamp: new Date(),
          processingTime: duration
        }
      };
    }

    // 6. Guardar en cache (simple LRU)
    if (responseCache.size > 100) {
      const firstKey = responseCache.keys().next().value;
      if (firstKey) {
        responseCache.delete(firstKey);
      }
    }
    responseCache.set(cacheKey, response);

    logger.info('Prompt procesado exitosamente', {
      processingTime: duration,
      hasAction: !!response.action
    });

    return response;

  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error('Error procesando prompt', error);

    // Manejar diferentes tipos de errores
    if (error && typeof error === 'object' && 'code' in error) {
      // Error de AI personalizado
      throw error;
    } else if (error && typeof error === 'object' && 'status' in error) {
      // Error de API de Google
      throw createAIError(
        'API_ERROR',
        `Error en la API de Google: ${(error as any).message}`,
        {
          status: (error as any).status,
          processingTime
        }
      );
    } else {
      // Error desconocido
      throw createAIError(
        'UNKNOWN',
        'Error inesperado procesando el prompt',
        {
          originalError: error,
          processingTime
        }
      );
    }
  }
}

/**
 * Función para limpiar el cache
 */
export function clearCache(): void {
  responseCache.clear();
  logger.info('Cache limpiado');
}

/**
 * Función para obtener estadísticas del cache
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: responseCache.size,
    keys: Array.from(responseCache.keys())
  };
}
