import type { VercelRequest, VercelResponse } from '@vercel/node';
import { promptModel } from '../angular-app/src/ai/index';

// Storage en memoria para nombres de usuario (en producción usarías una base de datos)
let userProfile = {
  name: '',
  isNewUser: true,
  conversationCount: 0
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, tech } = req.query;

    if (!prompt || !tech) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['prompt', 'tech']
      });
    }

    // Incrementar contador de conversación
    userProfile.conversationCount++;

    // Usar nombre guardado o nombre genérico
    const userName = userProfile.name || 'Usuario';

    console.log(`🤖 Processing prompt: "${prompt}" for ${userName} (${tech})`);
    console.log(`👤 User profile BEFORE:`, JSON.stringify(userProfile, null, 2));

    const response = await promptModel(prompt as string, userName, tech as 'angular' | 'react', userProfile);

    // Logging detallado de la respuesta
    console.log('🔍 AI Response:', JSON.stringify(response, null, 2));

    if (response.action) {
      console.log('✅ Action detected:', response.action.type, response.action.params);
    } else {
      console.log('ℹ️ No action in response');
    }

    // CRITICAL: Verificar si la IA detectó un nombre en la respuesta
    if (response.userName && response.userName !== userName) {
      console.log(`📝 AI detected name: "${response.userName}" (current: "${userName}")`);
      console.log(`🔄 UPDATING GLOBAL USER PROFILE...`);

      // ACTUALIZAR EL PERFIL GLOBAL DEL SERVIDOR
      userProfile.name = response.userName;
      userProfile.isNewUser = false;

      console.log(`👤 User profile AFTER update:`, JSON.stringify(userProfile, null, 2));
    } else {
      console.log(`ℹ️ No name update needed. AI response userName: ${response.userName}, current: ${userName}`);
    }

    return res.json(response);
  } catch (error) {
    console.error('❌ Error in /api/prompt:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
