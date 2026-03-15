import express from 'express';
import { readDb, writeDb } from '../lib/db.js';
import { makeId, isExamAvailableNow } from '../lib/core.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createError } from '../middleware/error.js';

const router = express.Router();

function parseBoolean(value) {
  if (value === undefined) {
    return null;
  }
  if (String(value).toLowerCase() === 'true') {
    return true;
  }
  if (String(value).toLowerCase() === 'false') {
    return false;
  }
  return null;
}

function sanitizeExamPayload(input, current = null) {
  const payload = input || {};
  const base = current || {};
  const exam = {
    id: base.id,
    title: payload.title !== undefined ? String(payload.title).trim() : base.title,
    description: payload.description !== undefined ? String(payload.description).trim() : base.description,
    type: payload.type !== undefined ? String(payload.type) : base.type,
    duration: payload.duration !== undefined ? Number(payload.duration) : Number(base.duration),
    status: payload.status !== undefined ? String(payload.status) : base.status
  };

  if (!exam.title || !exam.description || !exam.type || !exam.duration || !exam.status) {
    throw createError(400, 'title, description, type, duration and status are required');
  }

  if (!['free', 'scheduled'].includes(exam.type)) {
    throw createError(400, 'type must be free or scheduled');
  }

  if (!['active', 'inactive'].includes(exam.status)) {
    throw createError(400, 'status must be active or inactive');
  }

  if (!Number.isFinite(exam.duration) || exam.duration <= 0) {
    throw createError(400, 'duration must be a positive number');
  }

  if (exam.type === 'scheduled') {
    const startTime = payload.startTime !== undefined ? String(payload.startTime) : base.startTime;
    const endTime = payload.endTime !== undefined ? String(payload.endTime) : base.endTime;
    if (!startTime || !endTime) {
      throw createError(400, 'startTime and endTime are required for scheduled exam');
    }
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
      throw createError(400, 'startTime must be before endTime');
    }
    exam.startTime = new Date(start).toISOString();
    exam.endTime = new Date(end).toISOString();
  }

  return exam;
}

function sanitizeQuestionPayload(input, fallbackExamId) {
  const question = input || {};
  const content = String(question.content || '').trim();
  const options = Array.isArray(question.options) ? question.options : [];
  const correctOptionId = String(question.correctOptionId || '').trim();
  const explanation = question.explanation !== undefined ? String(question.explanation) : '';

  if (!content || options.length < 2 || !correctOptionId) {
    throw createError(400, 'question requires content, options and correctOptionId');
  }

  const normalizedOptions = options.map((option) => ({
    id: String(option.id || '').trim(),
    text: String(option.text || '').trim()
  }));

  for (const option of normalizedOptions) {
    if (!option.id || !option.text) {
      throw createError(400, 'each option requires id and text');
    }
  }

  const optionIds = new Set(normalizedOptions.map((item) => item.id));
  if (!optionIds.has(correctOptionId)) {
    throw createError(400, 'correctOptionId must exist in options');
  }

  return {
    id: question.id ? String(question.id) : makeId('q'),
    examId: question.examId ? String(question.examId) : fallbackExamId,
    content,
    options: normalizedOptions,
    correctOptionId,
    explanation
  };
}

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { search = '', type, status, availableNow } = req.query;
    const db = await readDb();
    const keyword = String(search).toLowerCase().trim();
    const availableFilter = parseBoolean(availableNow);

    let exams = db.exams.filter((exam) => {
      const byKeyword = !keyword
        ? true
        : [exam.title, exam.description].join(' ').toLowerCase().includes(keyword);
      const byType = type ? exam.type === type : true;
      const byStatus = status ? exam.status === status : true;
      return byKeyword && byType && byStatus;
    });

    if (req.user.role === 'student') {
      exams = exams.filter((exam) => exam.status === 'active');
    }

    if (availableFilter !== null) {
      exams = exams.filter((exam) => isExamAvailableNow(exam) === availableFilter);
    }

    const withMeta = exams
      .map((exam) => ({
        ...exam,
        questionCount: db.questions.filter((q) => q.examId === exam.id).length,
        availableNow: isExamAvailableNow(exam)
      }))
      .sort((a, b) => a.title.localeCompare(b.title));

    res.status(200).json({ ok: true, data: withMeta });
  } catch (error) {
    next(error);
  }
});

router.get('/:examId', async (req, res, next) => {
  try {
    const db = await readDb();
    const exam = db.exams.find((item) => item.id === req.params.examId);

    if (!exam) {
      throw createError(404, 'Exam not found');
    }

    if (req.user.role === 'student' && exam.status !== 'active') {
      throw createError(403, 'Exam is not available');
    }

    const payload = {
      ...exam,
      questionCount: db.questions.filter((q) => q.examId === exam.id).length,
      availableNow: isExamAvailableNow(exam)
    };

    res.status(200).json({ ok: true, data: payload });
  } catch (error) {
    next(error);
  }
});

router.get('/:examId/questions', async (req, res, next) => {
  try {
    const db = await readDb();
    const exam = db.exams.find((item) => item.id === req.params.examId);

    if (!exam) {
      throw createError(404, 'Exam not found');
    }

    if (req.user.role === 'student' && exam.status !== 'active') {
      throw createError(403, 'Exam is not available');
    }

    const includeAnswers = req.user.role === 'admin' && parseBoolean(req.query.includeAnswers) === true;

    const questions = db.questions
      .filter((q) => q.examId === exam.id)
      .map((q) => {
        if (includeAnswers) {
          return q;
        }
        return {
          id: q.id,
          examId: q.examId,
          content: q.content,
          options: q.options
        };
      });

    res.status(200).json({ ok: true, data: questions });
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const db = await readDb();
    const exam = sanitizeExamPayload(req.body);
    exam.id = req.body && req.body.id ? String(req.body.id) : makeId('exam');

    if (db.exams.some((item) => item.id === exam.id)) {
      throw createError(409, 'Exam id already exists');
    }

    const questionsInput = Array.isArray(req.body?.questions) ? req.body.questions : [];
    const questions = questionsInput.map((item) => sanitizeQuestionPayload(item, exam.id));

    db.exams.push(exam);
    db.questions.push(...questions);
    await writeDb(db);

    res.status(201).json({
      ok: true,
      data: {
        exam,
        questionsCount: questions.length
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:examId', authorize('admin'), async (req, res, next) => {
  try {
    const db = await readDb();
    const index = db.exams.findIndex((item) => item.id === req.params.examId);

    if (index === -1) {
      throw createError(404, 'Exam not found');
    }

    const current = db.exams[index];
    const updatedExam = sanitizeExamPayload(req.body, current);
    updatedExam.id = current.id;
    db.exams[index] = updatedExam;

    if (Array.isArray(req.body?.questions)) {
      const incoming = req.body.questions.map((item) => sanitizeQuestionPayload(item, updatedExam.id));
      db.questions = db.questions.filter((q) => q.examId !== updatedExam.id);
      db.questions.push(...incoming);
    }

    await writeDb(db);

    res.status(200).json({ ok: true, data: updatedExam });
  } catch (error) {
    next(error);
  }
});

router.put('/:examId/questions', authorize('admin'), async (req, res, next) => {
  try {
    const db = await readDb();
    const exam = db.exams.find((item) => item.id === req.params.examId);

    if (!exam) {
      throw createError(404, 'Exam not found');
    }

    const questionsInput = Array.isArray(req.body?.questions) ? req.body.questions : null;
    if (!questionsInput) {
      throw createError(400, 'questions array is required');
    }

    const normalized = questionsInput.map((item) => sanitizeQuestionPayload(item, exam.id));
    db.questions = db.questions.filter((q) => q.examId !== exam.id);
    db.questions.push(...normalized);
    await writeDb(db);

    res.status(200).json({
      ok: true,
      data: {
        examId: exam.id,
        questionsCount: normalized.length
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:examId/questions/import', authorize('admin'), async (req, res, next) => {
  try {
    const db = await readDb();
    const exam = db.exams.find((item) => item.id === req.params.examId);
    if (!exam) {
      throw createError(404, 'Exam not found');
    }

    const rows = Array.isArray(req.body?.rows) ? req.body.rows : null;
    if (!rows) {
      throw createError(400, 'rows array is required');
    }

    const imported = [];
    for (const row of rows) {
      if (!row.question || !row.optionA || !row.optionB) {
        continue;
      }

      const letter = String(row.correctOption || 'A').trim().toUpperCase();
      const map = { A: 'optA', B: 'optB', C: 'optC', D: 'optD' };

      imported.push({
        id: makeId('q'),
        examId: exam.id,
        content: String(row.question),
        options: [
          { id: 'optA', text: String(row.optionA || '') },
          { id: 'optB', text: String(row.optionB || '') },
          { id: 'optC', text: String(row.optionC || '') },
          { id: 'optD', text: String(row.optionD || '') }
        ],
        correctOptionId: map[letter] || 'optA',
        explanation: row.explanation ? String(row.explanation) : ''
      });
    }

    db.questions.push(...imported);
    await writeDb(db);

    res.status(200).json({
      ok: true,
      data: {
        importedCount: imported.length,
        examId: exam.id
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:examId', authorize('admin'), async (req, res, next) => {
  try {
    const db = await readDb();
    const exam = db.exams.find((item) => item.id === req.params.examId);

    if (!exam) {
      throw createError(404, 'Exam not found');
    }

    db.exams = db.exams.filter((item) => item.id !== exam.id);
    db.questions = db.questions.filter((q) => q.examId !== exam.id);
    await writeDb(db);

    res.status(200).json({
      ok: true,
      data: {
        deleted: true,
        examId: exam.id
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
