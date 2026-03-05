import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getCurrentUser, getData, saveData, generateId } from '../lib/mockData';

export default function Exam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const examStartTimeKey = `quizano_startTime_${id}`;
  const examAnswersKey = `quizano_answers_${id}`;

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role === 'admin') {
      navigate('/');
      return;
    }

    const allExams = getData('quizano_exams');
    const allQuestions = getData('quizano_questions');

    const currentExam = allExams.find((e: any) => e.id === id);
    if (!currentExam) {
      navigate('/');
      return;
    }

    const examQuestions = allQuestions.filter((q: any) => q.examId === id);
    setExam(currentExam);
    setQuestions(examQuestions);

    // Restore draft answers from localStorage
    const savedDraft = localStorage.getItem(examAnswersKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setAnswers(parsed);
        }
      } catch { }
    }

    // Persistent timer: track start time in localStorage
    const durationMs = currentExam.duration * 60 * 1000;
    const savedStartTimestamp = localStorage.getItem(examStartTimeKey);

    if (savedStartTimestamp) {
      const elapsedMs = Date.now() - parseInt(savedStartTimestamp);
      const leftMs = durationMs - elapsedMs;
      if (leftMs <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.floor(leftMs / 1000));
      }
    } else {
      localStorage.setItem(examStartTimeKey, Date.now().toString());
      setTimeLeft(currentExam.duration * 60);
    }
  }, [id, navigate, examStartTimeKey, examAnswersKey]);

  // Auto-submit when time runs out
  const doSubmit = useCallback((isAuto: boolean) => {
    if (!exam || questions.length === 0) return;

    const latestAnswers = JSON.parse(localStorage.getItem(examAnswersKey) || '{}');
    const mergedAnswers = { ...answers, ...latestAnswers };

    let correctCount = 0;
    const answerRefs = [];

    for (const q of questions) {
      const userOpt = mergedAnswers[q.id] || null;
      answerRefs.push({ questionId: q.id, selectedOptionId: userOpt });
      if (userOpt && userOpt === q.correctOptionId) {
        correctCount++;
      }
    }

    const total = questions.length;
    const score = total > 0 ? parseFloat(((correctCount / total) * 10).toFixed(2)) : 0;
    const user = getCurrentUser();
    const startTimestamp = parseInt(localStorage.getItem(examStartTimeKey) || Date.now().toString());

    const result = {
      id: generateId("res"),
      studentId: user.id,
      examId: exam.id,
      startTime: new Date(startTimestamp).toISOString(),
      submitTime: new Date().toISOString(),
      answers: answerRefs,
      correctCount,
      totalQuestions: total,
      score,
      status: "completed"
    };

    const allResults = getData('quizano_results');
    saveData('quizano_results', [...allResults, result]);

    // Clean up localStorage draft
    localStorage.removeItem(examStartTimeKey);
    localStorage.removeItem(examAnswersKey);

    if (!isAuto) {
      alert(`Nộp bài thành công! Điểm số: ${score}/10`);
    }

    navigate(`/result/${result.id}`);
  }, [exam, questions, answers, examStartTimeKey, examAnswersKey, navigate]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && exam) {
      doSubmit(true);
    }
  }, [timeLeft, exam, doSubmit]);

  const handleOptionChange = (qId: string, optId: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [qId]: optId };
      // Save draft to localStorage
      localStorage.setItem(examAnswersKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = () => {
    const answerCount = Object.keys(answers).length;
    if (!confirm(`Bạn có chắc chắn muốn nộp bài?\nĐã chọn: ${answerCount}/${questions.length} câu.`)) {
      return;
    }
    doSubmit(false);
  };

  if (!exam) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <DashboardLayout
      title=""
      headerRight={
        <div className="px-6 py-2 bg-[var(--color-ink)] text-white rounded-lg font-display font-bold text-xl shadow-md tracking-wider">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      }
    >
      <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto flex-1 min-h-0">
        {/* Exam Title Full Width */}
        <div className="w-full">
          <h2 className="text-2xl font-display font-bold text-[var(--color-ink)]">
            {exam.title}
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full flex-1 min-h-0">
          {/* Left Navigation Grid */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24 border border-gray-100 flex flex-col gap-3">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--color-pencil)]">Câu hỏi</h3>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, idx) => (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    key={q.id}
                    className={`w-9 h-9 flex items-center justify-center rounded-md font-sans font-bold text-xs transition-all border
                       ${currentQuestionIndex === idx
                        ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-1 scale-105 z-10'
                        : ''
                      }
                       ${answers[q.id]
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                        : 'bg-gray-50 text-[var(--color-ink)] border-gray-200 hover:border-gray-400'
                      }
                     `}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Main Paper Content */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <LooseLeafCard holesCount={8} className="flex-1" contentClassName="flex flex-col justify-between py-6 md:py-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-row gap-3 mb-2">
                  <h4 className="font-sans font-bold text-2xl text-[var(--color-primary)] shrink-0">Câu {currentQuestionIndex + 1}:</h4>
                  <p className="font-sans text-lg md:text-xl text-[var(--color-ink)] leading-relaxed pt-1">
                    {questions[currentQuestionIndex]?.content}
                  </p>
                </div>

                <div className="flex flex-col gap-3 ml-10">
                  {questions[currentQuestionIndex]?.options.map((opt: any) => (
                    <label key={opt.id} className="flex flex-row items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="radio"
                          name={`question-${questions[currentQuestionIndex].id}`}
                          value={opt.id}
                          checked={answers[questions[currentQuestionIndex].id] === opt.id}
                          onChange={() => handleOptionChange(questions[currentQuestionIndex].id, opt.id)}
                          className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
                        />
                      </div>
                      <span className={`font-sans text-lg transition-colors ${answers[questions[currentQuestionIndex].id] === opt.id ? 'font-bold text-[var(--color-primary)]' : 'text-gray-700 group-hover:text-black'}`}>
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-dashed border-[var(--color-paper-line)] pt-6 mt-8 flex justify-between items-center">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-1.5 border-2 border-[var(--color-ink)] text-[var(--color-ink)] font-sans font-bold text-sm rounded-lg disabled:opacity-30 transition-all hover:bg-gray-100"
                  >
                    Câu trước
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="px-4 py-1.5 border-2 border-[var(--color-ink)] text-[var(--color-ink)] font-sans font-bold text-sm rounded-lg disabled:opacity-30 transition-all hover:bg-gray-100"
                  >
                    Câu sau
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-8 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-bold text-lg rounded-xl shadow-md transition-transform hover:scale-105"
                >
                  Nộp bài
                </button>
              </div>
            </LooseLeafCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
