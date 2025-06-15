const ANGULAR_PRODUCTS = [
  {
    id: "6631",
    name: "Angular T-shirt",
    description: "High-quality Angular branded t-shirt for developers.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/6631-1.webp"],
    price: 25,
    discount_price: 19,
    availability: "normal",
    created_at: "2024-03-08T12:00"
  },
  {
    id: "2372",
    name: "Angular Sweatshirt",
    description: "Comfortable Angular sweatshirt for coding sessions.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/2372-1.webp"],
    price: 39,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-07T12:00"
  },
  {
    id: "3936",
    name: "Angular Stickers",
    description: "Angular stickers pack for your laptop.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/3936-1.webp"],
    price: 5.99,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-07T11:00"
  },
  {
    id: "1002",
    name: "Angular Mug",
    description: "Start your day with this Angular mug.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/1002-1.webp"],
    price: 9,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-06T12:00"
  },
  {
    id: "5551",
    name: "Pixel 8 Pro",
    description: "Latest Google Pixel phone.",
    category_ids: ["tech"],
    images: ["/mock-data/imgs/5551-1.webp"],
    price: 999,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-03T10:00"
  }
];

const REACT_PRODUCTS = [
  {
    id: "react-001",
    name: "React T-shirt",
    description: "Comfortable React branded t-shirt.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/6631-1.webp"],
    price: 25,
    discount_price: 19,
    availability: "normal",
    created_at: "2024-03-08T12:00"
  },
  {
    id: "react-002",
    name: "React Sweatshirt",
    description: "Warm React sweatshirt.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/2372-1.webp"],
    price: 39,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-07T12:00"
  },
  {
    id: "react-003",
    name: "React Stickers",
    description: "React stickers for developers.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/3936-1.webp"],
    price: 5.99,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-07T11:00"
  },
  {
    id: "react-004",
    name: "React Mug",
    description: "Coffee mug with React logo.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/1002-1.webp"],
    price: 9,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-06T12:00"
  }
];

export default function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tech = req.query.tech as string;

    if (!tech || (tech !== 'angular' && tech !== 'react')) {
      return res.status(400).json({ error: 'Invalid or missing tech parameter' });
    }

    const products = tech === 'angular' ? ANGULAR_PRODUCTS : REACT_PRODUCTS;
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 4);

    return res.status(200).json(recommended);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
