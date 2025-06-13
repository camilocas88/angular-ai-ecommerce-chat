// Import data directly
import { data } from '../src/data';

interface Product {
  id: string;
  name: string;
  description: string;
  category_ids: string[];
  images: string[];
  price: number;
  discount_price: number;
  availability: 'normal' | 'low' | 'none';
  parameters?: Array<{
    name: string;
    value: string;
  }>;
  created_at: string;
}

async function getRecommendedProducts(tech: 'angular' | 'react'): Promise<Product[]> {
  const products = data[tech].products as Product[];
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}

export default async function handler(req: any, res: any) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const tech = req.query.tech as 'angular' | 'react';

    if (!tech || (tech !== 'angular' && tech !== 'react')) {
      res.status(400).json({ error: 'Invalid or missing tech parameter' });
      return;
    }

    const products = await getRecommendedProducts(tech);
    res.status(200).json(products);

  } catch (error) {
    console.error('Error in recommended-products API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
