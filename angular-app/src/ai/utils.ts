import { data } from '../data';
import { AIError, Category, DataStructure, Product, SimpleProduct, TechStack } from './types';

// Logger mejorado
export class AILogger {
  private static instance: AILogger;

  static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  info(message: string, meta?: any) {
    console.log(`ℹ️ [AI] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  error(message: string, error?: any) {
    console.error(`❌ [AI] ${message}`, error);
  }

  warn(message: string, meta?: any) {
    console.warn(`⚠️ [AI] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  debug(message: string, meta?: any) {
    if (process.env['NODE_ENV'] === 'development') {
      console.debug(`🐛 [AI] ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
}

// Utilidades para productos
export class ProductUtils {
  // Obtener datos completos
  static getDataStructure(tech: TechStack): DataStructure {
    return data[tech] as DataStructure;
  }

  // Obtener lista de productos completa
  static getProductList(tech: TechStack): Product[] {
    const dataStructure = this.getDataStructure(tech);
    return dataStructure?.products || [];
  }

  // Obtener categorías
  static getCategories(tech: TechStack): Category[] {
    const dataStructure = this.getDataStructure(tech);
    return dataStructure?.categories || [];
  }

  // Convertir producto completo a producto simple para AI
  static toSimpleProduct(product: Product, categories: Category[]): SimpleProduct {
    // Obtener el nombre de la primera categoría
    const categoryName = product.category_ids.length > 0
      ? categories.find(cat => cat.id === product.category_ids[0])?.name || 'Sin categoría'
      : 'Sin categoría';

    return {
      id: product.id,
      name: product.name,
      category: categoryName,
      price: product.discount_price > 0 ? product.discount_price : product.price,
      description: product.description
    };
  }

  // Obtener productos simples para AI
  static getSimpleProducts(tech: TechStack): SimpleProduct[] {
    const products = this.getProductList(tech);
    const categories = this.getCategories(tech);

    return products.map(product => this.toSimpleProduct(product, categories));
  }

  // Formatear productos para AI
  static formatProductsForAI(tech: TechStack): string {
    const simpleProducts = this.getSimpleProducts(tech);
    return simpleProducts
      .map(product => `${product.id} - ${product.name} (${product.category}) - $${product.price}`)
      .join('\n');
  }

  // Buscar producto por ID
  static findProduct(tech: TechStack, id: string): Product | null {
    const products = this.getProductList(tech);
    return products.find(product => product.id === id) || null;
  }

  // Buscar productos simples
  static searchProducts(tech: TechStack, query: string): SimpleProduct[] {
    const simpleProducts = this.getSimpleProducts(tech);
    const searchTerm = query.toLowerCase();

    return simpleProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
    );
  }

  // Obtener productos recomendados (por ejemplo, los más nuevos)
  static getRecommendedProducts(tech: TechStack, limit: number = 5): SimpleProduct[] {
    const products = this.getProductList(tech);
    const categories = this.getCategories(tech);

    // Ordenar por fecha de creación (más nuevos primero)
    const sortedProducts = products
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return sortedProducts.map(product => this.toSimpleProduct(product, categories));
  }
}

// Generador de prompts mejorado
export class PromptBuilder {
  private context: string = '';
  private instructions: string[] = [];
  private products: string = '';

  setUserContext(name: string): this {
    this.context = `El usuario se llama ${name}. Sé amigable y útil.`;
    return this;
  }

  addInstruction(instruction: string): this {
    this.instructions.push(instruction);
    return this;
  }

  setProducts(tech: TechStack): this {
    this.products = ProductUtils.formatProductsForAI(tech);
    return this;
  }

  build(userPrompt: string): string {
    const basePrompt = `
Eres un asistente útil para un ecommerce que ayuda a los usuarios con sus compras.

CONTEXTO:
${this.context}

INSTRUCCIONES:
${this.instructions.map(inst => `- ${inst}`).join('\n')}

PRODUCTOS DISPONIBLES:
${this.products}

CONSULTA DEL USUARIO:
${userPrompt}

Responde de manera natural y útil.`;

    return basePrompt.trim();
  }
}

// Utilidades para manejo de errores
export function createAIError(
  code: AIError['code'],
  message: string,
  details?: any
): AIError {
  return { code, message, details };
}

// Validador de entrada
export function validateInput<T>(
  data: unknown,
  schema: any,
  errorMessage: string = 'Datos de entrada inválidos'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    throw createAIError('INVALID_INPUT', errorMessage, error);
  }
}

// Medidor de tiempo
export function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      resolve({ result, duration });
    } catch (error) {
      reject(error);
    }
  });
}
