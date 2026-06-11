import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    console.log("Consultando modelos disponibles...");
    // Intentamos usar el fetch directo a la API de listado para ver qué pasa
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json() as any;
    
    if (data.models) {
      console.log("✅ Modelos encontrados:");
      data.models.forEach((m: any) => console.log(`- ${m.name}`));
    } else {
      console.log("❌ No se devolvieron modelos. Respuesta:", JSON.stringify(data));
    }
  } catch (error: any) {
    console.log("❌ Error fatal al listar modelos:", error.message);
  }
}
listModels();
