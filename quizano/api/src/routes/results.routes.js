import express from 'express';
import { readDb, writeDb } from '../lib/db.js';
import { makeId, isExamAvailableNow, gradeResult } from '../lib/core.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createError } from '../middleware/error.js';

const router = express.Router();

function parseBoolean(value) {
  if (value === undefined) {
    return false;
  }
  return String(value).toLowerCase() === 'true';
}

function buildDetailedResult(result, db) {
  const exam = db.exams.find((item) => item.id === result.examId) || null;
  const questions = db.questions.filter((q) => q.examId === result.examId);
  const answerMap = new Map();

  for (const item of result.answers || []) {
    answerMap.set(item.questionId, item.selectedOptionId || null);
  }

  const details = questions.map((q) => {
    const selectedOptionId = answerMap.has(q.id) ? answerMap.get(q.id) : null;
    return {
      questionId: q.id,
      content: q.content,
      options: q.options,
      selectedOptionId,
      correctOptionId: q.correctOptionId,
      isCorrect: selectedOptionId === q.correctOptionId,
      explanation: q.explanation || ''
    };
  });

  return {
    ...result,
    exam,
    details
  };
}

router.use(authenticate);

router.post('/submit', authorize('student'), async (req, res, next) => {
  try {
    const { examId, startTime, answers } = req.body || {};

    if (!examId || !Array.isArray(answers)) {
      throw createError(400, 'examId and answers array are required');
    }

    const db = await readDb();
    const exam = db.exams.find((item) => item.id === examId);
    if (!exam) {
      throw createError(404, 'Exam not found');
    }

    if (!isExamAvailableNow(exam)) {
      throw createError(400, 'Exam is not currently available');
    }

    const questions = db.questions.filter((q) => q.examId === exam.id);
    if (questions.length === 0) {
      throw createError(400, 'Exam has no questions');
    }

    const questionIdSet = new Set(questions.map((q) => q.id));
    for (const item of answers) {
      if (!item.questionId || !questionIdSet.has(item.questionId)) {
        throw createError(400, 'answers contain invalid questionId');
      }
    }

    const grading = gradeResult(questions, answers);

    const parsedStart = startTime ? new Date(startTime) : new Date();
    if (Number.isNaN(parsedStart.getTime())) {
      throw createError(400, 'startTime is invalid');
    }

    const result = {
      id: makeId('res'),
      studentId: req.user.id,
      examId: exam.id,
      startTime: parsedStart.toISOString(),
      submitTime: new Date().toISOString(),
      answers: grading.answers,
      correctCount: grading.correctCount,
      totalQuestions: grading.totalQuestions,
      score: grading.score,
      status: 'completed'
    };

    db.results.push(result);
    await writeDb(db);

    res.status(201).json({
      ok: true,
      data: {
        resultId: result.id,
        score: result.score,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        status: result.status
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authorize('student'), async (req, res, next) => {
  try {
    const examId = req.query.examId ? String(req.query.examId) : null;
    const db = await readDb();

    let rows = db.results.filter((item) => item.studentId === req.user.id);
    if (examId) {
      rows = rows.filter((item) => item.examId === examId);
    }

    rows.sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());

    const examMap = new Map(db.exams.map((exam) => [exam.id, exam]));
    const response = rows.map((row) => ({
      ...row,
      examTitle: examMap.get(row.examId)?.title || null
    }));

    res.status(200).json({ ok: true, data: response });
  } catch (error) {
    next(error);
  }
});

router.get('/me/latest', authorize('student'), async (req, res, next) => {
  try {
    const db = await readDb();
    const rows = db.results
      .filter((item) => item.studentId === req.user.id)
      .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());

    if (rows.length === 0) {
      throw createError(404, 'No result found');
    }

    res.status(200).json({ ok: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.get('/:resultId', async (req, res, next) => {
  try {
    const includeDetails = parseBoolean(req.query.includeDetails);
    const db = await readDb();
    const result = db.results.find((item) => item.id === req.params.resultId);

    if (!result) {
      throw createError(404, 'Result not found');
    }

    const isOwner = req.user.role === 'student' && result.studentId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      throw createError(403, 'Forbidden');
    }

    const payload = includeDetails ? buildDetailedResult(result, db) : result;
    res.status(200).json({ ok: true, data: payload });
  } catch (error) {
    next(error);
  }
});

export default router;
