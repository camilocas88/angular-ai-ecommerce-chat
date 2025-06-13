// Servidor simple para desarrollo - Solo API
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { promptModel } from './ai';

const app = express();

// Storage en memoria para nombres de usuario (en producción usarías una base de datos)
let userProfile = {
  name: '', // Nombre vacío por defecto
  isNewUser: true, // Flag para saber si es la primera vez
  conversationCount: 0
};

// Enable CORS for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:4201'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing JSON
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// AI Endpoint con manejo de nombres dinámicos
app.get('/api/prompt', async (req, res) => {
  try {
    const prompt = req.query['prompt'] as string;
    const tech = req.query['tech'] as 'angular' | 'react';
    const providedName = req.query['name'] as string;

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

    const response = await promptModel(prompt, userName, tech, userProfile);

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
});

// User info con nombre dinámico
app.get('/api/user', async (_, res) => {
  return res.json({
    name: userProfile.name || 'Usuario',
    email: 'usuario@example.com',
    isNewUser: userProfile.isNewUser,
    conversationCount: userProfile.conversationCount
  });
});

// Endpoint para actualizar nombre de usuario
app.post('/api/user/name', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Valid name is required'
      });
    }

    const cleanName = name.trim();
    console.log(`📝 [POST] Updating user name to: "${cleanName}"`);
    console.log(`👤 User profile BEFORE name update:`, JSON.stringify(userProfile, null, 2));

    userProfile.name = cleanName;
    userProfile.isNewUser = false;

    console.log(`👤 User profile AFTER name update:`, JSON.stringify(userProfile, null, 2));

    return res.json({
      message: 'Name updated successfully',
      name: cleanName,
      isNewUser: false
    });
  } catch (error) {
    console.error('❌ Error updating user name:', error);
    return res.status(500).json({
      error: 'Failed to update name'
    });
  }
});

// Endpoint para resetear usuario (para testing)
app.post('/api/user/reset', async (_, res) => {
  console.log('🔄 Resetting user profile');
  userProfile = {
    name: '',
    isNewUser: true,
    conversationCount: 0
  };

  return res.json({
    message: 'User profile reset successfully'
  });
});

// API endpoints adicionales
app.get('/api/products', async (req, res) => {
  const { getProducts } = await import('./api');
  const { categoryId, pageSize, page, name, sortBy, fromPrice, toPrice, batchIds, tech } = req.query;
  const params = {
    categoryId: categoryId as string,
    pageSize: pageSize ? Number(pageSize) : undefined,
    page: page ? Number(page) : undefined,
    name: name as string,
    sortBy: sortBy as 'price_asc' | 'price_desc',
    fromPrice: fromPrice ? Number(fromPrice) : undefined,
    toPrice: toPrice ? Number(toPrice) : undefined,
    batchIds: batchIds ? (Array.isArray(batchIds) ? batchIds : [batchIds]) as string[] : undefined
  };

  const products = await getProducts(tech as 'angular' | 'react', params);
  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const { getProduct } = await import('./api');
  const { tech } = req.query;
  const product = await getProduct(tech as 'angular' | 'react', req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

app.get('/api/categories', async (req, res) => {
  const { getCategories } = await import('./api');
  const tech = req.query['tech'] as 'angular' | 'react';
  const categories = await getCategories(tech as 'angular' | 'react');
  res.json(categories);
});

app.get('/api/recommended-products', async (req, res) => {
  const { getRecommendedProducts } = await import('./api');
  const tech = req.query['tech'] as 'angular' | 'react';
  const products = await getRecommendedProducts(tech as 'angular' | 'react');
  res.json(products);
});

// Start server
const PORT = process.env['PORT'] || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   GET /health');
  console.log('   GET /api/user');
  console.log('   POST /api/user/name');
  console.log('   POST /api/user/reset');
  console.log('   GET /api/prompt?prompt=...&tech=...');
  console.log('   GET /api/products');
  console.log('   GET /api/categories');
  console.log('   GET /api/recommended-products');
});

export default app;
