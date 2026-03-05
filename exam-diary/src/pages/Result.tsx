import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getCurrentUser, getData } from '../lib/mockData';

export default function Result() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState<any>(null);
    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            navigate('/');
            return;
        }

        const allResults = getData('quizano_results');
        const allExams = getData('quizano_exams');
        const allQuestions = getData('quizano_questions');

        const currentResult = allResults.find((r: any) => r.id === id);
        if (!currentResult) {
            navigate('/');
            return;
        }

        const currentExam = allExams.find((e: any) => e.id === currentResult.examId);
        const examQuestions = allQuestions.filter((q: any) => q.examId === currentResult.examId);

        setResult(currentResult);
        setExam(currentExam);
        setQuestions(examQuestions);
    }, [id, navigate]);

    if (!result || !exam) return null;

    return (
        <DashboardLayout title="Kết Quả Bài Thi">
            <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
                <LooseLeafCard holesCount={6}>
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center justify-center border-b-2 border-dashed border-[var(--color-paper-line)] pb-8 pt-4">
                            <h2 className="text-3xl font-display font-bold text-center mb-6">Kết Quả: {exam.title}</h2>

                            <div className="flex flex-row justify-center items-center gap-16 w-full">
                                <div className="flex flex-col items-center">
                                    <span className="text-[var(--color-pencil)] font-sans font-bold text-sm uppercase tracking-wider mb-2">Điểm số</span>
                                    <div className="text-[5rem] font-note font-bold text-[var(--color-primary)] leading-none">{result.score}/10</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[var(--color-pencil)] font-sans font-bold text-sm uppercase tracking-wider mb-2">Số câu đúng</span>
                                    <div className="text-[4rem] font-note font-bold text-[var(--color-ink)] leading-none">{result.correctCount}/{result.totalQuestions}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-10 mt-6">
                            {questions.map((q, idx) => {
                                const studentAnswer = result.answers.find((a: any) => a.questionId === q.id)?.selectedOptionId;
                                const isCorrect = studentAnswer === q.correctOptionId;

                                return (
                                    <div key={q.id} className="flex flex-col bg-white/50 p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex flex-row gap-4 mb-4">
                                            <h4 className="font-sans font-bold text-xl text-[var(--color-ink)] shrink-0">Câu {idx + 1}:</h4>
                                            <p className="font-sans text-lg text-[var(--color-ink)]">{q.content}</p>
                                        </div>

                                        <div className="flex flex-col gap-3 ml-12">
                                            {q.options.map((opt: any) => {
                                                let optClass = "text-gray-700";
                                                let icon = null;

                                                if (opt.id === q.correctOptionId) {
                                                    optClass = "font-bold text-green-600 bg-green-50 px-3 py-1 rounded-md inline-flex max-w-fit";
                                                    icon = "✓";
                                                } else if (opt.id === studentAnswer && studentAnswer !== q.correctOptionId) {
                                                    optClass = "font-bold text-red-600 bg-red-50 px-3 py-1 rounded-md inline-flex max-w-fit line-through";
                                                    icon = "✗";
                                                }

                                                return (
                                                    <div key={opt.id} className={`font-sans text-md flex items-center gap-2 ${optClass}`}>
                                                        {icon && <span className="text-lg font-bold w-4">{icon}</span>}
                                                        {opt.text}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="mt-4 ml-12 p-3 bg-yellow-50 border border-yellow-200 rounded-md font-sans text-sm text-[var(--color-ink)]">
                                            <span className="font-bold mr-2">Giải thích:</span>
                                            {q.explanation}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center mt-8">
                            <Link to="/" className="px-8 py-3 bg-[var(--color-ink)] hover:bg-[#1f1313] text-white font-sans font-bold text-lg rounded-xl shadow-md transition-colors">
                                Về Trang Chủ
                            </Link>
                        </div>
                    </div>
                </LooseLeafCard>
            </div>
        </DashboardLayout>
    );
}
