import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Summarizes a list of simulated browser history items into a concise activity description.
 */
export const summarizeActivity = async (historyItems: string[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return "API Key Missing: Cannot summarize.";
  }

  if (historyItems.length === 0) {
    return "No activity detected.";
  }

  try {
    const prompt = `
      You are an intelligent productivity assistant. 
      Analyze the following list of website titles and URLs visited by a user during a 90-minute work block.
      Summarize the user's primary focus or task into a single, professional sentence (max 15 words).
      
      Browser History:
      ${historyItems.map(item => `- ${item}`).join('\n')}
      
      Summary:
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary.";
  }
};

/**
 * Generates a motivational tip based on the current plant status.
 */
export const getFocusTip = async (plantLevel: number): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Keep focusing to grow your garden!";

  try {
    const prompt = `Give me a very short (max 10 words), nature-themed motivational quote for someone growing a virtual plant (Level ${plantLevel}/4) by staying focused.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return response.text?.trim() || "Stay focused and grow!";
  } catch (e) {
    return "Stay focused and grow!";
  }
}
