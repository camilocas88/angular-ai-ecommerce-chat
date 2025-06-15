// Datos de categorías incluidos directamente
const ANGULAR_CATEGORIES = [
  {
    "id": "merch",
    "name": "Merchandise",
    "order": 1
  },
  {
    "id": "tech",
    "name": "Technology",
    "order": 2
  },
  {
    "id": "giftcard",
    "name": "Gift Cards",
    "order": 3
  }
];

const REACT_CATEGORIES = [
  {
    "id": "merch",
    "name": "Merchandise",
    "order": 1
  },
  {
    "id": "tech",
    "name": "Technology",
    "order": 2
  },
  {
    "id": "giftcard",
    "name": "Gift Cards",
    "order": 3
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

    const tech = req.query.tech;
    const categories = tech === 'react' ? REACT_CATEGORIES : ANGULAR_CATEGORIES;

    return res.status(200).json(categories);

  } catch (error) {
    console.error('Error in categories API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    });
  }
}
