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

    // Return basic user info for the chat
    const userInfo = {
      name: 'Usuario',
      isNewUser: true,
      conversationCount: 0
    };

    res.status(200).json(userInfo);

  } catch (error) {
    console.error('Error in user API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
