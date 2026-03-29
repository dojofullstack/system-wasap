import { createRequire } from "module";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";
import { agentChat } from "./demo-chatgpt.js";

config();

const require = createRequire(import.meta.url);
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// ---------------------------------------------------------------------------
// Carga de la memoria del agente
// ---------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT = readFileSync(join(__dirname, "agente_atencion_memory.md"), "utf-8");

// ---------------------------------------------------------------------------
// Historial de conversación por usuario (en memoria, dura mientras el proceso corre)
// ---------------------------------------------------------------------------
const conversationHistory = new Map(); // Map<phone: string, messages: {role, content}[]>
const MAX_HISTORY_MESSAGES = 20; // 10 turnos (user + assistant)

const ESCALATE_TEXT =
  "🙋 Entendido, te estoy conectando con un asesor humano. Por favor espera un momento, pronto te atenderán. ✅";

// ---------------------------------------------------------------------------
// Cliente WhatsApp
// ---------------------------------------------------------------------------
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: ".wwebjs_auth",
  }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("📱 Escanea el QR para iniciar sesión...");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("🔐 Sesión autenticada correctamente.");
});

client.on("auth_failure", (msg) => {
  console.error("❌ Error de autenticación:", msg);
});

client.on("disconnected", (reason) => {
  console.warn("⚠️ Bot desconectado:", reason);
});

client.on("ready", () => {
  console.log("✅ Bot conectado y listo!");
});

// ---------------------------------------------------------------------------
// Manejo de mensajes — agente autónomo
// ---------------------------------------------------------------------------
client.on("message", async (msg) => {
  // Ignorar mensajes sin texto (imágenes, stickers, audio, etc.)
  if (!msg.body || msg.body.trim() === "") return;

  const phone = msg.from;
  const userMessage = msg.body.trim();

  // Inicializar historial si es la primera vez que escribe este usuario
  if (!conversationHistory.has(phone)) {
    conversationHistory.set(phone, []);
  }
  const history = conversationHistory.get(phone);

  try {
    // Consultar al agente IA
    const result = await agentChat(userMessage, history, SYSTEM_PROMPT);

    // Actualizar historial con el turno actual
    history.push({ role: "user", content: userMessage });
    history.push({ role: "assistant", content: result.text });

    // Recortar historial para no crecer indefinidamente
    if (history.length > MAX_HISTORY_MESSAGES) {
      history.splice(0, history.length - MAX_HISTORY_MESSAGES);
    }

    // Derivar a asesor humano
    if (result.escalate) {
      await msg.reply(ESCALATE_TEXT);

      const advisorPhone = process.env.ADVISOR_PHONE;
      if (advisorPhone) {
        await client.sendMessage(
          advisorPhone,
          `⚠️ *Derivación a asesor*\n\n` +
          `📞 Cliente: ${phone}\n` +
          `💬 Último mensaje: "${userMessage}"`
        );
      }
      return;
    }

    // Notificar al CRM cuando el cliente confirma el pago
    if (result.order_complete) {
      const advisorPhone = process.env.ADVISOR_PHONE;
      if (advisorPhone) {
        // Recuperar los últimos mensajes para construir el resumen del pedido
        const lastMessages = history.slice(-10).map((m) => `${m.role === "user" ? "Cliente" : "Bot"}: ${m.content}`).join("\n");
        await client.sendMessage(
          advisorPhone,
          `🛒 *NUEVO PEDIDO CONFIRMADO — CRM*\n\n` +
          `📞 Cliente: ${phone}\n` +
          `✅ Pago confirmado por el cliente\n\n` +
          `📋 *Resumen de conversación (últimos mensajes):*\n${lastMessages}`
        );
      }
    }

    // Enviar respuesta con imagen si el agente decidió incluirla
    if (result.image_url) {
      try {
        const media = await MessageMedia.fromUrl(result.image_url, { unsafeMime: true });
        await msg.reply(media, null, { caption: result.text });
      } catch {
        // Si falla la carga de imagen, enviar solo texto
        await msg.reply(result.text);
      }
    } else {
      await msg.reply(result.text);
    }
  } catch (err) {
    console.error("❌ Error al procesar mensaje:", err);
    await msg.reply("Lo siento, ocurrió un error inesperado. Por favor intenta de nuevo. 🙏");
  }
});

client.initialize();
