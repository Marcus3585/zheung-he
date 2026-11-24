import { AssessmentResult } from '../types';
import { gradeLocally } from './historian';

/**
 * Written assessment stays on the ship.
 * This module does not call Gemini or any other language-model API.
 */

export const gradeStudentReflection = async (summary: string, reflection: string): Promise<AssessmentResult> => {
  return gradeLocally(summary, reflection);
};
