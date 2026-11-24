export type Subject = 'toan' | 'van';

export interface ParentGuide {
  keyConcept: string;
  guidingQuestion: string;
}

export interface LearningItem {
  id: string;
  subject: Subject;
  topic: string;
  sourceRef: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  hints: string[];
  commonMistake: string;
  parentGuide: ParentGuide;
}

export interface MistakeRecord {
  itemId: string;
  subject: Subject;
  topic: string;
  sourceRef: string;
  commonMistake: string;
  guidingQuestion: string;
  wrongCount: number;
}
