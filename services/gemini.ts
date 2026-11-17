import { GoogleGenAI, Type } from "@google/genai";
import { Location, AssessmentResult } from '../types';

// Initialize the API client
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not defined in the environment.");
    throw new Error("API configuration missing.");
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
你是一位精通明朝歷史和鄭和下西洋（三寶太監）的專家史官。
你正在為一款3D交互式冒險遊戲提供背景信息。
你的回答應當使用繁體中文，語氣古雅但易懂，富有教育意義且引人入勝。
當被問及某個地點時，解釋其對寶船艦隊的重要性，交易了什麼，以及發生了什麼重大事件（戰役、外交）。
如果用戶問一般性問題，請以博學的艦隊學者的口吻回答。
`;

// Helper for exponential backoff retry
async function withRetry<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // 503 is Service Unavailable (often overloaded), 429 is Rate Limit
    const shouldRetry = retries > 0 && (
        !error.status || 
        error.status === 503 || 
        error.status === 429 || 
        error.message.includes('fetch') ||
        error.message.includes('network')
    );

    if (shouldRetry) {
      console.warn(`Gemini API request failed. Retrying... Attempts left: ${retries}. Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Helper to clean JSON string if model adds markdown formatting
function cleanJsonString(text: string): string {
  let clean = text.trim();
  // Remove markdown code blocks if present
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return clean;
}

export const getLocationDetails = async (location: Location): Promise<string> => {
  try {
    return await withRetry(async () => {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `請描述 ${location.nameCn} (${location.name}) 在鄭和下西洋中的歷史重要性。提及貿易商品和外交關係。保持在150字以內。使用繁體中文。`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });
      return response.text || "暫無詳細信息。";
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return "無法獲取艦隊檔案。請檢查您的網絡連接或稍後再試。";
  }
};

export const chatWithHistorian = async (history: {role: string, parts: {text: string}[]} [], message: string): Promise<string> => {
  try {
    return await withRetry(async () => {
      const ai = getAI();
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: history
      });

      const response = await chat.sendMessage({ message });
      return response.text || "我現在無法回答這個問題。";
    });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "與隨船史官的通訊中斷。請稍後再試。";
  }
};

export const gradeStudentReflection = async (summary: string, reflection: string): Promise<AssessmentResult> => {
    try {
        return await withRetry(async () => {
            const ai = getAI();
            const prompt = `
            學生剛剛完成了一個關於鄭和下西洋的歷史決策遊戲。請針對學生的以下回答進行評分和點評。
            
            問題 1 (總結)：請簡述這次航行中發生的關鍵事件，以及你的決策如何影響了結果。
            學生回答：${summary}

            問題 2 (歷史觀點)：關於「鄭和下西洋是否得不償失」，你較贊同哪一方的觀點（值得 vs 不值得）？為甚麼？
            學生回答：${reflection}

            評分標準：
            - 每題滿分 10 分，總分 20 分。
            - 問題 1 評分：根據學生對遊戲內歷史事件的描述準確度及自我反思深度。
            - 問題 2 評分：學生必須明確選擇一個立場（或中立），並引用有效的歷史理據支持。
              - 支持「值得」的理據應包括：引進先進技術（如稻米）、推廣文化、建立外交、帶回珍稀物產等。
              - 支持「不值得」的理據應包括：花費巨大（六百萬兩）、財政負擔、帶回奢侈品而非必需品、勞民傷財。
              - 只要言之有理，有史實支持，即可得高分。
            - 必須返回 JSON 格式。
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score1: { type: Type.INTEGER, description: "Score for question 1 (0-10)" },
                            score2: { type: Type.INTEGER, description: "Score for question 2 (0-10)" },
                            feedback1: { type: Type.STRING, description: "Detailed feedback for question 1 in Traditional Chinese" },
                            feedback2: { type: Type.STRING, description: "Detailed feedback for question 2 in Traditional Chinese" },
                            totalComment: { type: Type.STRING, description: "Overall encouraging comment in Traditional Chinese" }
                        },
                        required: ["score1", "score2", "feedback1", "feedback2", "totalComment"]
                    }
                }
            });

            if (response.text) {
                try {
                    const cleanText = cleanJsonString(response.text);
                    return JSON.parse(cleanText) as AssessmentResult;
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                    throw new Error("Malformed JSON response");
                }
            }
            throw new Error("Empty response");
        });
    } catch (error) {
        console.error("Grading Error:", error);
        return {
            score1: 0,
            score2: 0,
            feedback1: "評分系統暫時無法連接。",
            feedback2: "請稍後再試。",
            totalComment: "ERROR_CONNECTION" // Special flag to detect error in UI
        };
    }
};