import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generates a romantic caption or text based on a user's prompt.
 */
export const generateRomanticText = async (prompt: string, tone: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const systemInstruction = `Você é um assistente romântico e poeta apaixonado. 
    Sua missão é ajudar o usuário a escrever textos bonitos, legendas ou cartas de amor para o parceiro(a) deles.
    O tom deve ser: ${tone}.
    Use português do Brasil. Seja criativo, evite clichês excessivos, mas seja emotivo.
    Responda apenas com o texto sugerido, sem introduções como "Aqui está sua sugestão".`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        maxOutputTokens: 300,
      }
    });

    return response.text || "Não foi possível gerar o texto no momento.";
  } catch (error) {
    console.error("Erro ao gerar texto com Gemini:", error);
    return "Desculpe, tive um problema ao buscar inspiração. Tente novamente.";
  }
};

/**
 * Suggests a title for a memory based on its content.
 */
export const suggestTitle = async (content: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Leia o seguinte texto e crie um título curto (máximo 5 palavras), criativo e bonito para uma memória de casal. Texto: "${content}"`,
    });
    return response.text?.replace(/"/g, '').trim() || "Nova Memória";
  } catch (error) {
    console.error(error);
    return "Memória Especial";
  }
}

/**
 * Generates a daily deep romantic message (Love Wall).
 */
export const generateDailyMessage = async (): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const prompts = [
      "Escreva uma frase profunda sobre a conexão de almas entre duas pessoas que se amam.",
      "Crie uma reflexão poética sobre como o amor transforma a vida.",
      "Escreva uma mensagem apaixonada sobre a eternidade do amor verdadeiro.",
      "Defina o amor de uma forma intensa e romântica em uma frase.",
      "Uma frase sobre a sorte de encontrar o grande amor da vida."
    ];
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    const response = await ai.models.generateContent({
      model: model,
      contents: randomPrompt,
      config: {
        systemInstruction: "Você é um poeta romântico clássico. Escreva uma mensagem curta (máximo 2 frases), intensa, apaixonada e profunda para um casal. Use Português do Brasil. Evite gírias, foque na emoção.",
        temperature: 0.9,
      }
    });

    return response.text || "O amor é a poesia dos sentidos.";
  } catch (error) {
    console.error("Erro ao gerar mensagem diária:", error);
    return "Que o amor de vocês seja hoje mais forte do que ontem.";
  }
};

/**
 * Generates a daily sweet affection message (Affection Wall).
 */
export const generateAffectionMessage = async (): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const prompts = [
      "Escreva uma frase curta e muito fofa sobre o conforto de um abraço.",
      "Uma mensagem doce sobre sorrir ao ver a pessoa amada.",
      "Uma frase carinhosa sobre cuidar um do outro nos dias difíceis.",
      "Algo fofo sobre dividir o cobertor ou assistir filmes juntos.",
      "Uma mensagem de 'bom dia' ou 'boa noite' cheia de chamego para o casal."
    ];
    
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    const response = await ai.models.generateContent({
      model: model,
      contents: randomPrompt,
      config: {
        systemInstruction: "Você é um amigo carinhoso e doce. Escreva uma mensagem curta (máximo 2 frases) que seja 'fofa', leve e aconchegante (cute/cozy). Use palavras como 'chamego', 'abraço', 'carinho', 'sorriso'. Português do Brasil.",
        temperature: 1,
      }
    });

    return response.text || "Nada melhor do que o seu abraço para recarregar as energias.";
  } catch (error) {
    console.error("Erro ao gerar mensagem de carinho:", error);
    return "O carinho é a linguagem silenciosa do amor.";
  }
};