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

// Datos incluidos directamente para evitar problemas de importación en Vercel
const angularProducts: Product[] = [
  {
    "id": "6631",
    "name": "Angular T-shirt",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacus tortor, scelerisque nec lectus et, elementum hendrerit justo.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/6631-1.webp"],
    "price": 25,
    "discount_price": 19,
    "availability": "normal",
    "created_at": "2024-03-08T12:00"
  },
  {
    "id": "2372",
    "name": "Angular Sweatshirt",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacus tortor, scelerisque nec lectus et, elementum hendrerit justo.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/2372-1.webp"],
    "price": 39,
    "discount_price": 0,
    "availability": "normal",
    "created_at": "2024-03-07T12:00"
  },
  {
    "id": "3936",
    "name": "Angular Stickers",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacus tortor, scelerisque nec lectus et, elementum hendrerit justo.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/3936-1.webp"],
    "price": 5.99,
    "discount_price": 0,
    "availability": "normal",
    "parameters": [{"name": "Count", "value": "8"}],
    "created_at": "2024-03-07T11:00"
  },
  {
    "id": "1002",
    "name": "Angular Mug",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacus tortor, scelerisque nec lectus et, elementum hendrerit justo.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/1002-1.webp"],
    "price": 9,
    "discount_price": 0,
    "availability": "normal",
    "created_at": "2024-03-06T12:00"
  },
  {
    "id": "9925",
    "name": "Google I/O T-shirt",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacus tortor, scelerisque nec lectus et, elementum hendrerit justo.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/9925-1.webp"],
    "price": 25,
    "discount_price": 0,
    "availability": "normal",
    "created_at": "2024-03-05T12:00"
  },
  {
    "id": "5551",
    "name": "Pixel 8 Pro",
    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacus tortor, scelerisque nec lectus et, elementum hendrerit justo.",
    "category_ids": ["tech"],
    "images": ["/mock-data/imgs/5551-1.webp", "/mock-data/imgs/5551-2.webp", "/mock-data/imgs/5551-3.webp"],
    "price": 999,
    "discount_price": 0,
    "availability": "normal",
    "parameters": [{"name": "Space", "value": "128 GB"}, {"name": "Color", "value": "Mint"}],
    "created_at": "2024-03-03T10:00"
  }
];

const reactProducts: Product[] = [
  {
    "id": "react-001",
    "name": "React T-shirt",
    "description": "Comfortable React branded t-shirt for developers who love React.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/6631-1.webp"],
    "price": 25,
    "discount_price": 19,
    "availability": "normal",
    "created_at": "2024-03-08T12:00"
  },
  {
    "id": "react-002",
    "name": "React Sweatshirt",
    "description": "Warm and cozy React sweatshirt perfect for coding sessions.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/2372-1.webp"],
    "price": 39,
    "discount_price": 0,
    "availability": "normal",
    "created_at": "2024-03-07T12:00"
  },
  {
    "id": "react-003",
    "name": "React Stickers",
    "description": "High-quality React stickers for your laptop and devices.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/3936-1.webp"],
    "price": 5.99,
    "discount_price": 0,
    "availability": "normal",
    "parameters": [{"name": "Count", "value": "8"}],
    "created_at": "2024-03-07T11:00"
  },
  {
    "id": "react-004",
    "name": "React Mug",
    "description": "Start your day with coffee in this React branded mug.",
    "category_ids": ["merch"],
    "images": ["/mock-data/imgs/1002-1.webp"],
    "price": 9,
    "discount_price": 0,
    "availability": "normal",
    "created_at": "2024-03-06T12:00"
  },
  {
    "id": "react-005",
    "name": "React Hooks Book",
    "description": "Complete guide to React Hooks and modern React patterns.",
    "category_ids": ["tech"],
    "images": ["/mock-data/imgs/5551-1.webp"],
    "price": 49.99,
    "discount_price": 39.99,
    "availability": "normal",
    "created_at": "2024-03-05T12:00"
  },
  {
    "id": "react-006",
    "name": "React Development Kit",
    "description": "Essential tools and resources for React development.",
    "category_ids": ["tech"],
    "images": ["/mock-data/imgs/7263-1.webp"],
    "price": 79.99,
    "discount_price": 0,
    "availability": "normal",
    "created_at": "2024-03-04T12:00"
  }
];

async function getRecommendedProducts(tech: 'angular' | 'react'): Promise<Product[]> {
  const products = tech === 'angular' ? angularProducts : reactProducts;
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
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
