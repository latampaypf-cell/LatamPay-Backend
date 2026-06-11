/**
 * Define los roles permitidos en la conversación del chat.
 * 'user': El mensaje enviado por el usuario.
 * 'model': La respuesta generada por la IA (Gemini).
 */
export type ChatRole = 'user' | 'model';

/**
 * Representa un mensaje individual en el historial de la conversación.
 */
export interface ChatMessage {
  role: ChatRole;
  text: string;
}

/**
 * Estructura de la petición para el chatbot.
 */
export interface SupportChatRequest {
  message: string;
  history?: ChatMessage[];
}

/**
 * Estructura de la respuesta enviada al frontend.
 */
export interface SupportChatResponse {
  reply: string;
  updatedHistory: ChatMessage[];
}
