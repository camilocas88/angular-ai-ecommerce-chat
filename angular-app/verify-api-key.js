const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function verifyApiKey() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ No se encontró API key en las variables de entorno');
    console.log('Asegúrate de que el archivo .env contenga:');
    console.log('GEMINI_API_KEY=tu_api_key_aqui');
    return;
  }

  console.log('🔍 Verificando API key...');
  console.log(`API key encontrada: ${apiKey.substring(0, 10)}...`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent("Hello, please respond with a simple greeting.");
    const response = await result.response;
    const text = response.text();

    console.log('✅ API key válida!');
    console.log('📝 Respuesta de prueba:', text);
  } catch (error) {
    console.error('❌ Error al verificar API key:');
    console.error(error.message);

    if (error.message.includes('API key not valid')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verifica que la API key esté correcta');
      console.log('2. Ve a https://aistudio.google.com/app/apikey y genera una nueva API key');
      console.log('3. Asegúrate de que la API esté habilitada en tu proyecto de Google Cloud');
    }
  }
}

verifyApiKey();
