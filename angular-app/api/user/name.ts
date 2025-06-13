export default async function handler(req: any, res: any) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // For now, just return success since we don't have persistent storage
    const { name } = req.body || {};

    res.status(200).json({
      success: true,
      message: `Name updated to ${name || 'Unknown'}`
    });

  } catch (error) {
    console.error('Error in user/name API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
