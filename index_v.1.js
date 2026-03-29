const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '.wwebjs_auth'
  }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Mostrar QR para escanear con WhatsApp
client.on('qr', (qr) => {
  console.log('📱 Escanea el QR para iniciar sesión...');
  qrcode.generate(qr, { small: true });
});

// Sesión restaurada sin necesidad de QR
client.on('authenticated', () => {
  console.log('🔐 Sesión autenticada correctamente.');
});

// Error de autenticación
client.on('auth_failure', (msg) => {
  console.error('❌ Error de autenticación:', msg);
});

// Desconexión
client.on('disconnected', (reason) => {
  console.warn('⚠️ Bot desconectado:', reason);
});

// Confirmar conexión exitosa
client.on('ready', () => {
  console.log('✅ Bot conectado y listo!');
});

// Menú interactivo
client.on('message', async (msg) => {
  try {
    // Ignorar mensajes sin texto (imágenes, stickers, audio, etc.)
    if (!msg.body) return;

    const text = msg.body
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // elimina tildes y diacríticos
      .replace(/[^a-z0-9\s]/g, '');     // elimina caracteres especiales
    
    //   console.log(`📩 Mensaje recibido de ${msg.from}: "${text}"`);

    if (text === 'catalogo' || text === 'menu') {
      await msg.reply(
        `👋 ¡Bienvenido! ¿En qué te ayudo?\n\n` +
        `1️⃣ Ver precios\n` +
        `2️⃣ Hablar con un asesor\n` +
        `3️⃣ Más información\n` +
        `4️⃣ Ver promociones\n` +
        `5️⃣ Categorías\n\n` +
        `Responde con el número.`
      );
    } else if (text === '5' || text === 'categorias') {
      await msg.reply(
        `🗂️ *Categorías disponibles:*\n\n` +
        `1️⃣ iPhone\n` +
        `2️⃣ Mac\n` +
        `3️⃣ iPad\n` +
        `4️⃣ Apple Watch\n` +
        `5️⃣ AirPods\n` +
        `6️⃣ Vision Pro\n` +
        `7️⃣ Servicios y Suscripciones\n` +
        `8️⃣ Hogar y Audio\n` +
        `9️⃣ Accesorios de Productividad\n` +
        `🔟 AirTag y Organización\n\n` +
        `Responde con *cat1*, *cat2* ... *cat10* para ver más info.`
      );
    } else if (text === 'cat1') {
      await msg.reply(
        `📱 *iPhone*\n\n` +
        `El producto estrella de Apple. Incluye desde los modelos Pro hasta el SE y accesorios MagSafe.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat2') {
      await msg.reply(
        `💻 *Mac*\n\n` +
        `Computadoras portátiles (MacBook Air/Pro) y de escritorio (iMac, Mac mini, Studio).\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat3') {
      await msg.reply(
        `📟 *iPad*\n\n` +
        `Tablets para todo perfil, desde el modelo de entrada hasta el iPad Pro con chip M-Series.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat4') {
      await msg.reply(
        `⌚ *Apple Watch*\n\n` +
        `Relojes inteligentes (Series, Ultra y SE) con un fuerte enfoque en salud y deporte.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat5') {
      await msg.reply(
        `🎧 *AirPods*\n\n` +
        `La línea completa de audio inalámbrico: AirPods estándar, Pro y Max.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat6') {
      await msg.reply(
        `🥽 *Vision Pro*\n\n` +
        `La nueva categoría de computación espacial y realidad mixta de Apple.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat7') {
      await msg.reply(
        `🔑 *Servicios y Suscripciones*\n\n` +
        `AppleCare+, Apple One, Music, TV+ y almacenamiento en iCloud.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat8') {
      await msg.reply(
        `🏠 *Hogar y Audio*\n\n` +
        `Altavoces HomePod, Apple TV 4K y dispositivos compatibles con HomeKit.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat9') {
      await msg.reply(
        `⌨️ *Accesorios de Productividad*\n\n` +
        `Apple Pencil, Magic Keyboards, ratones y trackpads.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === 'cat10') {
      await msg.reply(
        `🏷️ *AirTag y Organización*\n\n` +
        `Rastreadores AirTag para localizar tus objetos con precisión desde la app Buscar.\n\n` +
        `Escribe *menu* para volver al menú principal.`
      );
    } else if (text === '1') {
      await msg.reply('💰 Nuestros planes desde $300 USD');
    } else if (text === '2') {
      await msg.reply('Un asesor te contactará pronto ✅');
    } else if (text === '3') {
      await msg.reply('ℹ️ Visita nuestro sitio web o escríbenos para más información.');
    } else if (text === '4') {
      const descripcion =
        `📱 *iPhone 13* — ¡Promoción de hoy! 🔥\n` +
        `💵 *Precio: $450 USD*\n\n` +
        `Este iPhone es compatible con eSIM. Además, cuenta con ranura nano-SIM.\n\n` +
        `Sistema de dos cámaras. Chip A15 Bionic superrápido. Batería para todo el día. Diseño resistente. Y una espectacular pantalla Super Retina XDR.\n\n` +
        `*Características:*\n` +
        `• Pantalla Super Retina XDR de 6,1"\n` +
        `• Modo Cine con baja profundidad de campo\n` +
        `• Sistema de dos cámaras de 12 MP (gran angular y ultra gran angular)\n` +
        `• Cámara frontal TrueDepth de 12 MP\n` +
        `• Chip A15 Bionic con GPU de 4 núcleos\n` +
        `• Hasta 19 horas de reproducción de video\n` +
        `• Ceramic Shield; resistencia al agua y al polvo\n` +
        `• Accesorios MagSafe para carga inalámbrica más rápida\n` +
        `• iOS 17 con funcionalidad En Espera`;

      try {
        const media = await MessageMedia.fromUrl(
          'https://mac-center.com.pe/cdn/shop/files/iPhone_13_Starlight_PDP_Image_position-2__CLCO_v1.jpg'
        );
        await msg.reply(media, null, { caption: descripcion });
      } catch {
        await msg.reply(descripcion);
      }
    }
  } catch (err) {
    console.error('❌ Error al procesar mensaje:', err);
  }
});

client.initialize();