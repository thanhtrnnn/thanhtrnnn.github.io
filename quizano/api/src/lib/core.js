import crypto from 'crypto';

function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { password, ...safe } = user;
  return safe;
}

function isExamAvailableNow(exam, now = new Date()) {
  if (exam.status !== 'active') {
    return false;
  }
  if (exam.type !== 'scheduled') {
    return true;
  }
  if (!exam.startTime || !exam.endTime) {
    return false;
  }
  const current = now.getTime();
  const start = new Date(exam.startTime).getTime();
  const end = new Date(exam.endTime).getTime();
  return current >= start && current <= end;
}

function gradeResult(questions, submittedAnswers) {
  const answerByQuestion = new Map();
  for (const item of submittedAnswers) {
    answerByQuestion.set(item.questionId, item.selectedOptionId || null);
  }

  const finalAnswers = [];
  let correctCount = 0;

  for (const q of questions) {
    const selectedOptionId = answerByQuestion.has(q.id) ? answerByQuestion.get(q.id) : null;
    finalAnswers.push({
      questionId: q.id,
      selectedOptionId
    });
    if (selectedOptionId && selectedOptionId === q.correctOptionId) {
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

export { makeId, sanitizeUser, isExamAvailableNow, gradeResult };
