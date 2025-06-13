import type { VercelRequest, VercelResponse } from '@vercel/node';

// Storage en memoria para nombres de usuario (compartido)
let userProfile = {
  name: '',
  isNewUser: true,
  conversationCount: 0
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.json({
      name: userProfile.name || 'Usuario',
      email: 'usuario@example.com',
      isNewUser: userProfile.isNewUser,
      conversationCount: userProfile.conversationCount
    });
  }

  if (req.method === 'POST') {
    try {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          error: 'Valid name is required'
        });
      }

      const cleanName = name.trim();
      console.log(`📝 [POST] Updating user name to: "${cleanName}"`);
      console.log(`👤 User profile BEFORE name update:`, JSON.stringify(userProfile, null, 2));

      userProfile.name = cleanName;
      userProfile.isNewUser = false;

      console.log(`👤 User profile AFTER name update:`, JSON.stringify(userProfile, null, 2));

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

  return res.status(405).json({ error: 'Method not allowed' });
}
