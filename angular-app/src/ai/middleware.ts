import { NextFunction, Request, Response } from 'express';
import { UserPromptSchema } from './types';
import { AILogger, validateInput } from './utils';

const logger = AILogger.getInstance();

// Rate limiting simple (en producción usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per minute
const WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Middleware de rate limiting
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  const clientData = requestCounts.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // Reset window
    requestCounts.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }

  if (clientData.count >= RATE_LIMIT) {
    logger.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }

  clientData.count++;
  next();
}

/**
 * Middleware de validación de entrada
 */
export function validatePromptMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt, tech, name } = req.query;

    validateInput(
      { prompt, tech, name },
      UserPromptSchema,
      'Parámetros de consulta inválidos'
    );

    next();
  } catch (error) {
    logger.error('Validation error', error);

    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request parameters',
      details: error
    });
  }
}

/**
 * Middleware de logging de requests
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;

    logger.info('Response sent', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      hasError: res.statusCode >= 400
    });

    return originalJson.call(this, body);
  };

  next();
}
