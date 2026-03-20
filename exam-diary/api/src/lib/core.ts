import crypto from 'crypto';

export function makeId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

export function sanitizeUser(user: any): any {
  if (!user) {
    return null;
  }
  const { password, ...safe } = user;
  return safe;
}

export function isExamAvailableNow(exam: any, now = new Date()): boolean {
  if (exam.status !== 'active') {
    return false;
  }
  if (exam.type !== 'scheduled') {
    return true;
  }
  if (!exam.start_time || !exam.end_time) {
    return false;
  }
  const current = now.getTime();
  const start = new Date(exam.start_time).getTime();
  const end = new Date(exam.end_time).getTime();
  return current >= start && current <= end;
}

export function gradeResult(questions: any[], submittedAnswers: any[]): any {
  const answerByQuestion = new Map();
  for (const item of submittedAnswers) {
    answerByQuestion.set(item.questionId, item.selectedOptionId || null);
  }

  const finalAnswers: any[] = [];
  let correctCount = 0;

  for (const q of questions) {
    const selectedOptionId = answerByQuestion.has(q.id) ? answerByQuestion.get(q.id) : null;
    finalAnswers.push({
      questionId: q.id,
      selectedOptionId
    });
    if (selectedOptionId && selectedOptionId === q.correct_option_id) {
      correctCount += 1;
    }
  }

  const totalQuestions = questions.length;
  const score = totalQuestions === 0 ? 0 : Number(((correctCount / totalQuestions) * 10).toFixed(2));

  return {
    correctCount,
    totalQuestions,
    score,
    answers: finalAnswers
  };
}
