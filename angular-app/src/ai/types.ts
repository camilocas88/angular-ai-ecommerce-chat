import { z } from 'zod';

// Tipos para la aplicación
export type TechStack = 'angular' | 'react';

// Esquemas de validación basados en la estructura real de los datos
export const UserPromptSchema = z.object({
  prompt: z.string().min(1, 'El prompt no puede estar vacío'),
  name: z.string().min(1, 'El nombre es requerido'),
  tech: z.enum(['angular', 'react'], {
    errorMap: () => ({ message: 'Tech debe ser "angular" o "react"' })
  })
});

// Esquema que coincide con la estructura real de los datos
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category_ids: z.array(z.string()),
  images: z.array(z.string()),
  price: z.number(),
  discount_price: z.number(),
  availability: z.string(),
  created_at: z.string(),
  parameters: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).optional()
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number()
});

// Tipos inferidos
export type UserPrompt = z.infer<typeof UserPromptSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Category = z.infer<typeof CategorySchema>;

// Estructura de datos completa
export interface DataStructure {
  categories: Category[];
  products: Product[];
}

// Tipos para respuestas de AI
export interface AIResponse {
  message: string;
  action?: {
    type: 'addToCart' | 'search' | 'recommend';
    params: Record<string, any>;
  };
  metadata?: {
    model: string;
    timestamp: Date;
    processingTime?: number;
  };
}

// Tipos para errores
export interface AIError {
  code: 'INVALID_INPUT' | 'API_ERROR' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
  details?: any;
}

// Tipo para la configuración de herramientas
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
}

export interface CartAction {
  id: string;
  quantity: number;
  productName: string;
}

// Producto simplificado para AI (sin datos internos)
export interface SimpleProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}
