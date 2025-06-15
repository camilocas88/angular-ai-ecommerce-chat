// Datos de productos incluidos directamente (usando los mismos de recommended-products.js)
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
    parameters: [{"name": "Space", "value": "128 GB"}, {"name": "Color", "value": "Mint"}],
    created_at: "2024-03-03T10:00"
  },
  {
    id: "9925",
    name: "Google I/O T-shirt",
    description: "High-quality Google I/O branded t-shirt.",
    category_ids: ["merch"],
    images: ["/mock-data/imgs/9925-1.webp"],
    price: 25,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-05T12:00"
  },
  {
    id: "8013",
    name: "Google Play $25 Gift Card",
    description: "Google Play gift card for apps and games.",
    category_ids: ["giftcard"],
    images: ["/mock-data/imgs/8013-1.webp"],
    price: 25,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-02T07:00"
  },
  {
    id: "9231",
    name: "Google Play $50 Gift Card",
    description: "Google Play gift card for apps and games.",
    category_ids: ["giftcard"],
    images: ["/mock-data/imgs/9231-1.webp"],
    price: 50,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-01T12:00"
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
    parameters: [{"name": "Count", "value": "8"}],
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
  },
  {
    id: "react-005",
    name: "React Hooks Book",
    description: "Complete guide to React Hooks and modern React patterns.",
    category_ids: ["tech"],
    images: ["/mock-data/imgs/5551-1.webp"],
    price: 49.99,
    discount_price: 39.99,
    availability: "normal",
    created_at: "2024-03-05T12:00"
  },
  {
    id: "react-gift-25",
    name: "React Store $25 Gift Card",
    description: "Gift card for React merchandise and courses.",
    category_ids: ["giftcard"],
    images: ["/mock-data/imgs/8013-1.webp"],
    price: 25,
    discount_price: 0,
    availability: "normal",
    created_at: "2024-03-02T07:00"
  }
];

function getProducts(tech, params = {}) {
  const allProducts = tech === 'react' ? REACT_PRODUCTS : ANGULAR_PRODUCTS;
  let filtered = [...allProducts];

  // Filter by category
  if (params.categoryId) {
    filtered = filtered.filter(p => p.category_ids.includes(params.categoryId));
  }

  // Filter by name
  if (params.name) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(params.name.toLowerCase())
    );
  }

  // Filter by price range
  if (params.fromPrice) {
    filtered = filtered.filter(p => p.price >= params.fromPrice);
  }

  if (params.toPrice) {
    filtered = filtered.filter(p => p.price <= params.toPrice);
  }

  // Filter by batch IDs
  if (params.batchIds && params.batchIds.length > 0) {
    filtered = filtered.filter(p => params.batchIds.includes(p.id));
  }

  // Sort
  if (params.sortBy === 'price_asc') {
    filtered = filtered.sort((a, b) => a.price - b.price);
  } else if (params.sortBy === 'price_desc') {
    filtered = filtered.sort((a, b) => b.price - a.price);
  }

  // Pagination
  if (params.page && params.pageSize) {
    const start = (params.page - 1) * params.pageSize;
    filtered = filtered.slice(start, start + params.pageSize);
  }

  return filtered;
}

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

    const { categoryId, pageSize, page, name, sortBy, fromPrice, toPrice, batchIds, tech } = req.query;

    const techParam = tech || 'angular'; // Default to angular

    const params = {
      categoryId: categoryId,
      pageSize: pageSize ? Number(pageSize) : undefined,
      page: page ? Number(page) : undefined,
      name: name,
      sortBy: sortBy,
      fromPrice: fromPrice ? Number(fromPrice) : undefined,
      toPrice: toPrice ? Number(toPrice) : undefined,
      batchIds: batchIds ? (Array.isArray(batchIds) ? batchIds : [batchIds]) : undefined
    };

    const products = getProducts(techParam, params);
    return res.status(200).json(products);

  } catch (error) {
    console.error('Error in products API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    });
  }
}
