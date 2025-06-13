// Import data directly
import { data } from '../../src/data';

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

async function getProduct(tech: 'angular' | 'react', id: string): Promise<Product | undefined> {
  return (data[tech].products as Product[]).find((p: Product) => p.id === id);
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

    const { id } = req.query;
    const tech = (req.query.tech as 'angular' | 'react') || 'angular';

    if (!id) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const product = await getProduct(tech, id as string);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json(product);

  } catch (error) {
    console.error('Error in product API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
