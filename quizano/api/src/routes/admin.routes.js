import express from 'express';
import { readDb } from '../lib/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { createError } from '../middleware/error.js';

const router = express.Router();

function makeResultDetails(result, db) {
  const exam = db.exams.find((item) => item.id === result.examId) || null;
  const questions = db.questions.filter((q) => q.examId === result.examId);
  const answers = new Map((result.answers || []).map((item) => [item.questionId, item.selectedOptionId || null]));

  return {
    ...result,
    exam,
    questions: questions.map((q) => ({
      id: q.id,
      content: q.content,
      options: q.options,
      explanation: q.explanation || '',
      correctOptionId: q.correctOptionId,
      selectedOptionId: answers.has(q.id) ? answers.get(q.id) : null,
      isCorrect: answers.get(q.id) === q.correctOptionId
    }))
  };
}

router.use(authenticate, authorize('admin'));

router.get('/results', async (req, res, next) => {
  try {
    const {
      examId,
      studentId,
      from,
      to,
      page = 1,
      limit = 20
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const db = await readDb();

    let rows = db.results.slice();

    if (examId) {
      rows = rows.filter((item) => item.examId === examId);
    }

    if (studentId) {
      rows = rows.filter((item) => item.studentId === studentId);
    }

    if (from) {
      const fromTs = new Date(from).getTime();
      if (Number.isNaN(fromTs)) {
        throw createError(400, 'from is invalid');
      }
      rows = rows.filter((item) => new Date(item.submitTime).getTime() >= fromTs);
    }

    if (to) {
      const toTs = new Date(to).getTime();
      if (Number.isNaN(toTs)) {
        throw createError(400, 'to is invalid');
      }
      rows = rows.filter((item) => new Date(item.submitTime).getTime() <= toTs);
    }

    rows.sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());

    const examMap = new Map(db.exams.map((item) => [item.id, item]));
    const userMap = new Map(db.users.map((item) => [item.id, item]));

    const totalItems = rows.length;
    const offset = (currentPage - 1) * perPage;
    const paged = rows.slice(offset, offset + perPage);

    const items = paged.map((row) => ({
      ...row,
      examTitle: examMap.get(row.examId)?.title || null,
      studentName: userMap.get(row.studentId)?.fullName || null,
      username: userMap.get(row.studentId)?.username || null,
      pass: row.score >= 5
    }));

    res.status(200).json({
      ok: true,
      data: {
        items,
        pagination: {
          page: currentPage,
          limit: perPage,
          totalItems,
          totalPages: Math.ceil(totalItems / perPage)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats/summary', async (req, res, next) => {
  try {
    const db = await readDb();
    const examId = req.query.examId ? String(req.query.examId) : null;

    let rows = db.results.slice();
    if (examId) {
      rows = rows.filter((item) => item.examId === examId);
    }

    const totalAttempts = rows.length;
    const sumScore = rows.reduce((acc, item) => acc + Number(item.score || 0), 0);
    const avgScore = totalAttempts === 0 ? 0 : Number((sumScore / totalAttempts).toFixed(2));
    const passCount = rows.filter((item) => item.score >= 5).length;
    const passRate = totalAttempts === 0 ? 0 : Number(((passCount / totalAttempts) * 100).toFixed(2));

    const distribution = {
      below3: 0,
      from3to5: 0,
      from5to7: 0,
      from7to9: 0,
      aboveOrEqual9: 0
    };

    for (const row of rows) {
      if (row.score < 3) distribution.below3 += 1;
      else if (row.score < 5) distribution.from3to5 += 1;
      else if (row.score < 7) distribution.from5to7 += 1;
      else if (row.score < 9) distribution.from7to9 += 1;
      else distribution.aboveOrEqual9 += 1;
    }

    res.status(200).json({
      ok: true,
      data: {
        totalAttempts,
        avgScore,
        passRate,
        distribution
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:studentId/journey', async (req, res, next) => {
  try {
    const db = await readDb();
    const student = db.users.find((item) => item.id === req.params.studentId && item.role === 'student');

    if (!student) {
      throw createError(404, 'Student not found');
    }

    const examMap = new Map(db.exams.map((exam) => [exam.id, exam]));

    const rows = db.results
      .filter((item) => item.studentId === student.id)
      .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime())
      .map((item) => ({
        ...item,
        examTitle: examMap.get(item.examId)?.title || null,
        pass: item.score >= 5
      }));

    res.status(200).json({
      ok: true,
      data: {
        student: {
          id: student.id,
          fullName: student.fullName,
          username: student.username,
          email: student.email
        },
        results: rows
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:studentId/results/:resultId', async (req, res, next) => {
  try {
    const db = await readDb();
    const student = db.users.find((item) => item.id === req.params.studentId && item.role === 'student');

    if (!student) {
      throw createError(404, 'Student not found');
    }

    const result = db.results.find((item) => item.id === req.params.resultId && item.studentId === student.id);
    if (!result) {
      throw createError(404, 'Result not found for this student');
    }

    const payload = makeResultDetails(result, db);
    res.status(200).json({ ok: true, data: payload });
  } catch (error) {
    next(error);
  }
});

export default router;
