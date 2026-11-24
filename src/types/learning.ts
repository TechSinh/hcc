export type Subject = 'toan' | 'van';

export interface LearningItem {
  id: string;
  subject: Subject;
  topic: string;
  sourceRef: string;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  hints: string[];
  commonMistake: string;
  parentGuide: {
    keyConcept: string;
    guidingQuestion: string;
  };
}