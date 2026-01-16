import { GoogleGenAI } from "@google/genai";
import { Location } from '../types.ts';

// Note: On GitHub Pages, process.env is polyfilled by index.html but will be empty unless manually set in build
// This prevents the app from crashing on load.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
你是一位精通明朝歷史和鄭和下西洋（三寶太監）的專家史官。
你正在為一款3D交互式冒險遊戲提供背景信息。
你的回答應當使用繁體中文，語氣古雅但易懂，富有教育意義且引人入勝。
當被問及某個地點時，解釋其對寶船艦隊的重要性，交易了什麼，以及發生了什麼重大事件（戰役、外交）。
如果用戶問一般性問題，請以博學的艦隊學者的口吻回答。
`;

export const getLocationDetails = async (location: Location): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `請描述 ${location.nameCn} (${location.name}) 在鄭和下西洋中的歷史重要性。提及貿易商品和外交關係。保持在150字以內。使用繁體中文。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "暫無詳細信息。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "無法獲取艦隊檔案。請檢查您的網絡連接或API金鑰。";
  }
};

export const chatWithHistorian = async (history: {role: string, parts: {text: string}[]} [], message: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history
    });

    const response = await chat.sendMessage({ message });
    return response.text || "我現在無法回答這個問題。";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "與隨船史官的通訊中斷。";
  }
};