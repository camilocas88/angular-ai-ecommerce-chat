import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Valid name is required'
      });
    }

    const cleanName = name.trim();
    console.log(`📝 [POST] Updating user name to: "${cleanName}"`);

    return res.json({
      message: 'Name updated successfully',
      name: cleanName,
      isNewUser: false
    });
  } catch (error) {
    console.error('❌ Error updating user name:', error);
    return res.status(500).json({
      error: 'Failed to update name'
    });
  }
}
