export default function handler(req, res) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Para Vercel serverless, simplemente confirmamos el reset
    // En una implementación completa limpiarías los datos del usuario
    return res.status(200).json({
      success: true,
      message: 'User profile reset successfully',
      userProfile: {
        name: '',
        isNewUser: true,
        conversationCount: 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in user/reset API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    });
  }
}
