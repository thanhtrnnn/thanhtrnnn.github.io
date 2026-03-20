export type UserRole = 'admin' | 'student';

export type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
};

export type ExamType = 'free' | 'scheduled';
export type ExamStatus = 'active' | 'inactive';

export type Exam = {
  id: string;
  title: string;
  description: string;
  type: ExamType;
  startTime?: string;
  endTime?: string;
  duration: number;
  status: ExamStatus;
};

export type QuestionOption = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  examId: string;
  content: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
};

export type ResultAnswer = {
  questionId: string;
  selectedOptionId: string | null;
};

export type Result = {
  id: string;
  studentId: string;
  examId: string;
  startTime: string;
  submitTime: string;
  answers: ResultAnswer[];
  correctCount: number;
  totalQuestions: number;
  score: number;
  status: string;
};

export type DbPayload = {
  users: User[];
  exams: Exam[];
  questions: Question[];
  results: Result[];
};
