import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { chat, summarize, translate, classifyText } from "./demo-chatgpt.js";

// Los tests llaman a la API real, por eso son async y pueden tardar algunos segundos.

describe("chat()", () => {
  it("devuelve un string no vacío", async () => {
    const respuesta = await chat("Responde solo con la palabra: OK");
    assert.equal(typeof respuesta, "string");
    assert.ok(respuesta.trim().length > 0, "La respuesta no debe estar vacía");
  });

  it("acepta un mensaje de sistema personalizado", async () => {
    const respuesta = await chat(
      "¿Cuál es tu función?",
      "Eres un experto en JavaScript."
    );
    assert.equal(typeof respuesta, "string");
    assert.ok(respuesta.length > 0);
  });
});

describe("summarize()", () => {
  it("devuelve un resumen más corto que el texto original", async () => {
    const texto =
      "La inteligencia artificial es una rama de la informática que busca crear sistemas " +
      "capaces de realizar tareas que normalmente requieren inteligencia humana, como el " +
      "aprendizaje, el razonamiento y la resolución de problemas complejos. Ha evolucionado " +
      "enormemente en los últimos años gracias al aumento de la capacidad computacional y a " +
      "la disponibilidad de grandes conjuntos de datos de entrenamiento.";

    const resumen = await summarize(texto);
    assert.equal(typeof resumen, "string");
    assert.ok(resumen.trim().length > 0, "El resumen no debe estar vacío");
    assert.ok(
      resumen.length < texto.length,
      "El resumen debe ser más corto que el texto original"
    );
  });
});

describe("translate()", () => {
  it("traduce texto al inglés", async () => {
    const traduccion = await translate("Buenos días, ¿cómo estás?", "inglés");
    assert.equal(typeof traduccion, "string");
    assert.ok(traduccion.trim().length > 0, "La traducción no debe estar vacía");
    // Verifica que la respuesta contiene alguna palabra común en inglés
    const contieneIngles = /good\s*morning|how\s*are\s*you|hello|good\s*day/i.test(
      traduccion
    );
    assert.ok(contieneIngles, `Se esperaba texto en inglés, recibido: "${traduccion}"`);
  });

  it("traduce texto al francés", async () => {
    const traduccion = await translate("Hola", "francés");
    assert.equal(typeof traduccion, "string");
    assert.ok(traduccion.trim().length > 0);
  });
});

describe("classifyText()", () => {
  it("clasifica texto de comida", async () => {
    const categoria = await classifyText("Me encanta comer tacos y pizza con queso", [
      "comida",
      "deporte",
      "tecnología",
      "política",
    ]);
    assert.equal(typeof categoria, "string");
    assert.ok(
      categoria.toLowerCase().includes("comida"),
      `Se esperaba "comida", recibido: "${categoria}"`
    );
  });

  it("clasifica texto de tecnología", async () => {
    const categoria = await classifyText(
      "JavaScript es un lenguaje de programación muy popular para la web",
      ["comida", "deporte", "tecnología", "política"]
    );
    assert.equal(typeof categoria, "string");
    assert.ok(
      categoria.toLowerCase().includes("tecnolog"),
      `Se esperaba "tecnología", recibido: "${categoria}"`
    );
  });
});
