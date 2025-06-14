// Cargar variables de entorno primero
import 'dotenv/config';

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import cors from 'cors';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promptModel } from './ai';
import { getCategories, getProduct, getProducts, getRecommendedProducts } from './api';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Simple user profile for SSR server (could be enhanced with session management)
const defaultUserProfile = {
  name: '',
  isNewUser: true,
  conversationCount: 0
};

// Enable CORS for both React and Angular apps
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/api/prompt', async (req, res) => {
  const prompt = req.query['prompt'] as string;
  const tech = req.query['tech'] as 'angular' | 'react';
  const name = req.query['name'] as string;

  // Para el servidor SSR, usar un perfil básico (en producción podrías usar sesiones)
  const userProfile = {
    ...defaultUserProfile,
    name: name || 'Usuario'
  };

  const response = await promptModel(prompt, name || 'Usuario', tech, userProfile);
  res.json(response);
});

app.get('/api/user', async (_, res) => {
  res.json({
    name: 'Usuario',
    email: 'usuario@example.com',
    isNewUser: true,
    conversationCount: 0
  });
});

app.get('/api/products', async (req, res) => {
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
  const { tech } = req.query;
  const product = await getProduct(tech as 'angular' | 'react', req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

app.get('/api/categories', async (req, res) => {
  const tech = req.query['tech'] as 'angular' | 'react';
  const categories = await getCategories(tech as 'angular' | 'react');
  res.json(categories);
});

app.get('/api/recommended-products', async (req, res) => {
  const tech = req.query['tech'] as 'angular' | 'react';
  const products = await getRecommendedProducts(tech as 'angular' | 'react');
  res.json(products);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
