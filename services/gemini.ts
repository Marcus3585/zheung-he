import { AssessmentResult } from '../types';
import { answerHistorian, gradeLocally, HistorianTurn } from './historian';

/**
 * Chat and location notes are fully local.
 * Grading prefers the on-device rubric. A Gemini call is optional and
 * never required; a missing key or a failed request falls back immediately.
 */

export const chatWithHistorian = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
): Promise<string> => {
  const turns: HistorianTurn[] = history.map((turn) => ({
    role: turn.role,
    text: turn.parts.map((part) => part.text).join(''),
  }));
  return answerHistorian(message, turns);
};

function readOptionalKey(): string {
  try {
    return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  } catch {
    return '';
  }
}

async function gradeWithGemini(summary: string, reflection: string, apiKey: string): Promise<AssessmentResult | null> {
  const { GoogleGenAI, Type } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
學生剛完成鄭和下西洋的歷史決策遊戲。請用繁體中文（香港）點評，語氣像船上的史官，溫和、具體。

問題 1：${summary}
問題 2：${reflection}

每題 0 到 10 分，總分 20。
問題 2 要看見立場（值得、不值得，或兩邊都說得通）和至少一條史事。
只返回 JSON。
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score1: { type: Type.INTEGER },
          score2: { type: Type.INTEGER },
          feedback1: { type: Type.STRING },
          feedback2: { type: Type.STRING },
          totalComment: { type: Type.STRING },
        },
        required: ['score1', 'score2', 'feedback1', 'feedback2', 'totalComment'],
      },
    },
  });

  if (!response.text) return null;
  const clean = response.text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  const parsed = JSON.parse(clean) as AssessmentResult;
  if (typeof parsed.score1 !== 'number' || typeof parsed.score2 !== 'number') return null;
  parsed.score1 = Math.max(0, Math.min(10, Math.round(parsed.score1)));
  parsed.score2 = Math.max(0, Math.min(10, Math.round(parsed.score2)));
  return parsed;
}

export const gradeStudentReflection = async (summary: string, reflection: string): Promise<AssessmentResult> => {
  const local = gradeLocally(summary, reflection);
  const apiKey = readOptionalKey();
  if (!apiKey) return local;

  try {
    const remote = await Promise.race([
      gradeWithGemini(summary, reflection, apiKey),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 8000);
      }),
    ]);
    return remote ?? local;
  } catch (error) {
    console.warn('遠端評分沒有接上，改用船上的本機準則。', error);
    return local;
  }
};
