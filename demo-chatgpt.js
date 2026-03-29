import OpenAI from "openai";
import { config } from "dotenv";
import { fileURLToPath } from "url";

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Envía un mensaje al modelo usando la Responses API y devuelve la respuesta como string.
 * @param {string} userMessage - El mensaje del usuario.
 * @param {string} [systemMessage] - Instrucción de sistema (opcional).
 * @returns {Promise<string>}
 */
export async function chat(userMessage, systemMessage = "Eres un asistente útil.") {
  const response = await openai.responses.create({
    model: "gpt-5.4-mini",
    input: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    text: {
      format: { type: "text" },
    },
    reasoning: {
      effort: "medium",
      summary: "auto",
    },
    tools: [],
    store: true,
  });
  return response.output_text;
}

/**
 * Resume un texto largo en 2-3 oraciones.
 * @param {string} text - Texto a resumir.
 * @returns {Promise<string>}
 */
export async function summarize(text) {
  return chat(`Resume el siguiente texto en 2-3 oraciones:\n\n${text}`);
}

/**
 * Traduce un texto al idioma indicado.
 * @param {string} text - Texto a traducir.
 * @param {string} targetLanguage - Idioma destino (ej. "inglés", "francés").
 * @returns {Promise<string>}
 */
export async function translate(text, targetLanguage) {
  return chat(
    `Traduce el siguiente texto al ${targetLanguage}. Responde solo con la traducción:\n\n${text}`
  );
}

/**
 * Clasifica un texto dentro de una lista de categorías.
 * @param {string} text - Texto a clasificar.
 * @param {string[]} categories - Lista de categorías posibles.
 * @returns {Promise<string>}
 */
export async function classifyText(text, categories) {
  const catList = categories.join(", ");
  return chat(
    `Clasifica el siguiente texto en una de estas categorías: ${catList}.\nTexto: "${text}"\nResponde solo con el nombre de la categoría.`
  );
}

/**
 * Función principal del agente autónomo de atención al cliente.
 * Recibe el mensaje del usuario, el historial de conversación y el prompt del sistema,
 * y devuelve una respuesta estructurada.
 *
 * @param {string} userMessage - Mensaje del usuario.
 * @param {{ role: "user" | "assistant", content: string }[]} conversationHistory - Historial previo.
 * @param {string} systemPrompt - Contenido del archivo de memoria del agente.
 * @returns {Promise<{ text: string, image_url: string | null, escalate: boolean }>}
 */
export async function agentChat(userMessage, conversationHistory = [], systemPrompt = "") {
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-5.4-mini",
    messages,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0].message.content;

  try {
    const parsed = JSON.parse(raw);
    return {
      text: typeof parsed.text === "string" ? parsed.text : raw,
      image_url: parsed.image_url ?? null,
      escalate: parsed.escalate === true,
      order_complete: parsed.order_complete === true,
    };
  } catch {
    return { text: raw, image_url: null, escalate: false, order_complete: false };
  }
}

// ---------------------------------------------------------------------------
// Ejecución directa: demo rápida
// ---------------------------------------------------------------------------
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const respuesta = await chat("Que es un token en el contexto de los modelos de lenguaje de IA?");
  console.log("Respuesta del chat:", respuesta);
}
