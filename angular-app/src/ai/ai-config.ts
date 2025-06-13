import { googleAI } from '@genkit-ai/googleai';
import 'dotenv/config';
import { genkit } from 'genkit';

// Tipos personalizados
export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

// Configuración por defecto
const DEFAULT_CONFIG: AIConfig = {
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 1000
};

// Verificar API key
export function validateApiKey(): string {
  const apiKey = process.env['GEMINI_API_KEY'] ||
                 process.env['GOOGLE_API_KEY'] ||
                 process.env['GOOGLE_GENAI_API_KEY'];

  if (!apiKey) {
    throw new Error(
      '❌ API key no encontrada. Configura GEMINI_API_KEY en el archivo .env\n' +
      '📖 Obtén tu API key en: https://aistudio.google.com/app/apikey'
    );
  }

  console.log('✅ API key de Google AI cargada correctamente');
  return apiKey;
}

// Configurar instancia de AI
export function createAIInstance(config: Partial<AIConfig> = {}): any {
  try {
    validateApiKey();

    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    const ai = genkit({
      plugins: [googleAI()],
      model: googleAI.model(finalConfig.model)
    });

    console.log(`🤖 AI configurada con modelo: ${finalConfig.model}`);
    return ai;
  } catch (error) {
    console.error('❌ Error configurando AI:', error);
    throw error;
  }
}

export { DEFAULT_CONFIG };
