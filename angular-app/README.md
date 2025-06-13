# 🛒 Angular AI Ecommerce Chat

Una aplicación de ecommerce Angular moderna con asistente de IA integrado que permite a los usuarios navegar productos, obtener recomendaciones personalizadas y agregar items al carrito mediante conversaciones naturales.

## ✨ Características

- 🤖 **Asistente IA Bilingüe** (Español/Inglés) powered by Google Gemini
- 👤 **Detección automática de nombres** y personalización de conversaciones
- 🛍️ **Catálogo de productos** completo con categorías y filtros
- 🛒 **Carrito de compras** inteligente con integración por voz
- 💬 **Chat redimensionable** con controles avanzados
- 🎨 **UI moderna** con Angular 20 y standalone components
- 📱 **Responsive design** optimizado para mobile y desktop
- 🔄 **Estado persistente** durante la sesión

## 🚀 Demo en Vivo

[Ver Demo](https://your-app-url.vercel.app) *(Se agregará después del despliegue)*

## 🛠️ Stack Tecnológico

- **Frontend**: Angular 20, TypeScript, SCSS
- **Backend API**: Node.js, Express, TypeScript
- **IA**: Google Gemini 2.0 Flash
- **Desarrollo**: Hot reload, Nodemon, Concurrently
- **Despliegue**: Vercel

## 📦 Instalación

### Prerequisitos

- Node.js 20.11.0 o superior
- npm o yarn
- API Key de Google AI/Gemini

### Configuración Rápida

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/angular-ai-ecommerce.git
cd angular-ai-ecommerce
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env y agregar tu GEMINI_API_KEY
```

4. **Iniciar en modo desarrollo**
```bash
npm run dev
```

5. **Abrir la aplicación**
- Frontend: `http://localhost:4200`
- API: `http://localhost:4000`

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# API Key de Google AI/Gemini (REQUERIDA)
GEMINI_API_KEY=tu_api_key_aqui

# Puerto del servidor API (opcional)
PORT=4000
```

### 🔑 Obtener API Key de Google AI

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea un nuevo proyecto o selecciona uno existente
3. Genera una nueva API Key
4. Copia la key a tu archivo `.env`

## 📋 Scripts Disponibles

```bash
# Desarrollo completo (frontend + API)
npm run dev

# Solo frontend Angular
npm start

# Solo servidor API
npm run serve:api

# Build de producción
npm run build

# Tests
npm test

# Verificar API key
npm run check:env

# Resetear chat (desarrollo)
npm run reset:chat
```

## 🤖 Funcionalidades del Chat IA

### Comandos Soportados

- **Saludos**: "Hola", "Hello"
- **Búsqueda de productos**: "¿Tienes camisetas de Angular?"
- **Agregar al carrito**: "Agregar al carrito", "Add to cart"
- **Navegación**: Explorar categorías y productos

### Ejemplos de Conversación

```
Usuario: Hola
IA: ¡Hola! Bienvenido a nuestra tienda. ¿Podrías decirme tu nombre?

Usuario: María
IA: ¡Hola María! ¿En qué puedo ayudarte hoy?

Usuario: ¿Tienes camisetas de Angular?
IA: ¡Por supuesto! Tenemos camisetas de Angular disponibles. ¿Te gustaría agregarla al carrito?

Usuario: Sí
IA: ¡Perfecto! Agregando 1 x Angular T-shirt al carrito.
```

## 🏗️ Arquitectura

```
src/
├── ai/                     # Lógica de IA y Gemini
│   ├── index.ts           # Función principal promptModel
│   ├── add-to-cart.ts     # Herramienta de carrito
│   └── types.ts           # Tipos TypeScript
├── app/
│   ├── shared/
│   │   └── chat/          # Componentes del chat
│   ├── products/          # Módulo de productos
│   ├── cart/              # Módulo de carrito
│   └── home/              # Página principal
├── data/                  # Datos mock de productos
├── models/                # Modelos TypeScript
└── server-dev.ts          # Servidor API de desarrollo
```

## 🎨 Personalización del Chat

El chat incluye funcionalidades avanzadas:

- **Redimensionamiento**: Arrastra las esquinas para cambiar tamaño
- **Maximizar/Minimizar**: Doble-click en el header
- **Posicionamiento**: Botones para mover y resetear posición
- **Estado persistente**: Mantiene configuración en localStorage

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Fork/Clon este repositorio**
2. **Conecta con Vercel**
3. **Configura variables de entorno** en Vercel:
   - `GEMINI_API_KEY`: Tu API key de Google AI
4. **Despliega automáticamente**

### Netlify

1. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist/angular-app`
2. **Variables de entorno**: Agrega `GEMINI_API_KEY`

### Docker

```bash
# Build imagen
docker build -t angular-ai-ecommerce .

# Ejecutar container
docker run -p 4200:4200 -p 4000:4000 -e GEMINI_API_KEY=tu_key angular-ai-ecommerce
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- [Google AI/Gemini](https://ai.google.dev/) por la IA conversacional
- [Angular](https://angular.io/) por el framework frontend
- Comunidad open source por las librerías utilizadas

## 📞 Soporte

¿Tienes preguntas o problemas?

- 🐛 [Reportar un bug](https://github.com/tu-usuario/angular-ai-ecommerce/issues)
- 💡 [Solicitar feature](https://github.com/tu-usuario/angular-ai-ecommerce/issues)
- 📧 Email: tu-email@ejemplo.com

---

⭐ **¡Si te gusta este proyecto, no olvides darle una estrella!** ⭐
