// Datos de productos incluidos directamente
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
    parameters: [{"name": "Count", "value": "8"}],
    created_at: "2024-03-07T11:00"
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
  }
];

export default function handler(req, res) {
  try {
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

    const tech = req.query.tech || 'angular';
    const products = tech === 'react' ? REACT_PRODUCTS : ANGULAR_PRODUCTS;

    return res.status(200).json(products);

  } catch (error) {
    console.error('Error in products API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    });
  }
}
