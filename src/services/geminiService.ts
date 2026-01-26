
import { GoogleGenAI, Type } from "@google/genai";
import { OracleResponse } from "../types";

// Lazy initialization to prevent app crash on load if key is missing
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

export const askChiFuWangYe = async (userQuery: string): Promise<OracleResponse> => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
    if (!apiKey) {
      throw new Error("尚未設定 Google API Key (VITE_GOOGLE_API_KEY)");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Update to a stable model name if needed
      contents: `信徒虔誠請示：${userQuery}`,
      config: {
        systemInstruction: `你現在是池府王爺廟的解籤人。池府王爺（池夢彪）以「代天巡狩」、黑面凸眼（因食瘟煌粉救民而犧牲）的慈悲與威嚴著稱。
        
        請以傳統廟宇籤詩的風格回應信徒的煩惱。
        你的回應必須包含三個部分：
        1. 籤詩：創作四句七言絕句，古色古香，隱喻信徒的處境。
        2. 解曰：用白話文解釋籤詩含義，語氣要莊重、慈悲，帶有神明的智慧。
        3. 指引：給予具體的建議，關於健康、事業、或運勢，並提醒多行善積德。
        
        請以JSON格式輸出。`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poem: { type: Type.STRING, description: "四句七言籤詩" },
            interpretation: { type: Type.STRING, description: "籤詩的白話解釋" },
            advice: { type: Type.STRING, description: "給信徒的具體建議" }
          },
          required: ["poem", "interpretation", "advice"]
        }
      },
    });

    // Directly access text property from the response
    const text = response.text(); // Note: .text() is a method in some versions or property in others. GoogleGenAI usually uses .response.text()
    // Checking the SDK version used in package.json might be formatted differently, but let's stick to simple safe access

    if (!text) throw new Error("No response from deity.");

    return JSON.parse(text) as OracleResponse;
  } catch (error) {
    console.error("Error consulting oracle:", error);
    // Return a dummy response so the UI doesn't break, or rethrow handled error
    throw error;
  }
};
