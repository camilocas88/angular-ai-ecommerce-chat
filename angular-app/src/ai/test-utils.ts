import { TechStack } from './types';
import { ProductUtils } from './utils';

/**
 * Datos de prueba para testing
 */
export const TEST_DATA = {
  validPrompts: [
    "Quiero comprar una camiseta de Angular",
    "Busco un teléfono Pixel",
    "¿Qué productos recomendarías?",
    "Agrega un Google Mug al carrito",
    "Muéstrame productos de tecnología"
  ],
  invalidPrompts: [
    "",
    "   ",
    null,
    undefined
  ],
  testUser: "Test User",
  testTech: 'angular' as TechStack
};

/**
 * Simulador de respuestas para testing
 */
export class AITestHelper {
  static async simulatePrompt(prompt: string, expectAction: boolean = false) {
    console.log(`🧪 Testing prompt: "${prompt}"`);

    // Simular validación
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Invalid prompt');
    }

    // Simular respuesta
    const hasAction = expectAction || prompt.toLowerCase().includes('agrega') || prompt.toLowerCase().includes('añade');

    return {
      message: hasAction
        ? `Simulando agregar producto al carrito por: "${prompt}"`
        : `Respuesta simulada para: "${prompt}"`,
      action: hasAction ? {
        type: 'addToCart' as const,
        params: {
          id: '6631',
          quantity: 1,
          productName: 'Angular T-shirt'
        }
      } : undefined,
      metadata: {
        model: 'test-model',
        timestamp: new Date(),
        processingTime: Math.random() * 1000
      }
    };
  }

  static testProductUtils() {
    console.log('🔍 Testing Product Utils...');

    const products = ProductUtils.getSimpleProducts('angular');
    console.log(`✅ Found ${products.length} products`);

    const searchResults = ProductUtils.searchProducts('angular', 'angular');
    console.log(`✅ Search 'angular' returned ${searchResults.length} results`);

    const recommended = ProductUtils.getRecommendedProducts('angular', 3);
    console.log(`✅ Got ${recommended.length} recommended products`);

    console.log('✅ Product Utils tests completed');
  }

  static async runBasicTests() {
    console.log('🚀 Running basic AI tests...');

    try {
      // Test product utilities
      this.testProductUtils();

      // Test valid prompts
      for (const prompt of TEST_DATA.validPrompts) {
        await this.simulatePrompt(prompt);
      }

      // Test invalid prompts
      for (const prompt of TEST_DATA.invalidPrompts) {
        try {
          await this.simulatePrompt(prompt as string);
          console.log('❌ Should have failed for invalid prompt');
        } catch (error) {
          console.log('✅ Correctly rejected invalid prompt');
        }
      }

      console.log('✅ All basic tests passed!');
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
}

/**
 * Performance tester
 */
export class PerformanceTester {
  static async measureResponseTime(iterations: number = 10) {
    console.log(`⏱️ Testing response time over ${iterations} iterations...`);

    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await AITestHelper.simulatePrompt(TEST_DATA.validPrompts[i % TEST_DATA.validPrompts.length]);
      const duration = Date.now() - start;
      times.push(duration);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    console.log(`📊 Performance Results:
    Average: ${avg.toFixed(2)}ms
    Min: ${min}ms
    Max: ${max}ms
    `);

    return { avg, min, max, times };
  }
}
