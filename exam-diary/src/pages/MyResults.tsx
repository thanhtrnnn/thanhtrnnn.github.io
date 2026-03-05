import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getCurrentUser, getData, formatDate } from '../lib/mockData';

export default function MyResults() {
    const navigate = useNavigate();
    const [results, setResults] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user || user.role === 'admin') {
            navigate('/login');
            return;
        }

        const allResults = getData('quizano_results');
        const allExams = getData('quizano_exams');

        const myResults = allResults
            .filter((r: any) => r.studentId === user.id)
            .sort((a: any, b: any) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());

        setResults(myResults);
        setExams(allExams);
    }, [navigate]);

    const getExamTitle = (examId: string) => {
        const exam = exams.find((e: any) => e.id === examId);
        return exam ? exam.title : 'Kỳ thi đã bị xóa';
    };

    const getTimeTaken = (startTime: string, submitTime: string) => {
        const start = new Date(startTime).getTime();
        const end = new Date(submitTime).getTime();
        const diffMs = end - start;
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        return `${mins} phút ${secs} giây`;
    };

    return (
        <DashboardLayout title="Kết Quả Của Tôi">
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">

                {results.length === 0 ? (
                    <LooseLeafCard holesCount={4}>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="text-6xl mb-4">📝</span>
                            <h3 className="font-display font-bold text-2xl text-[var(--color-ink)] mb-2">Chưa có kết quả nào</h3>
                            <p className="font-sans text-lg text-[var(--color-pencil)]">Hãy tham gia một kỳ thi để xem kết quả tại đây.</p>
                            <Link to="/" className="mt-6 px-6 py-2.5 bg-[var(--color-primary)] text-white font-sans font-bold rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">
                                Xem các kỳ thi
                            </Link>
                        </div>
                    </LooseLeafCard>
                ) : (
                    results.map((r) => (
                        <Link to={`/result/${r.id}`} key={r.id} className="group">
                            <LooseLeafCard holesCount={2} className="w-full transition-shadow hover:shadow-lg" contentClassName="!p-0 !min-h-[auto]">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4 w-full">
                                    {/* Left info */}
                                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                        <h4 className="text-xl font-display font-bold text-[var(--color-ink)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                                            {getExamTitle(r.examId)}
                                        </h4>
                                        <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-sm font-sans text-[var(--color-pencil)]">
                                            <span>📅 {formatDate(r.submitTime)}</span>
                                            <span>⏱ {getTimeTaken(r.startTime, r.submitTime)}</span>
                                            <span>✅ {r.correctCount}/{r.totalQuestions} câu đúng</span>
                                        </div>
                                    </div>

                                    {/* Score badge */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <span className={`text-4xl font-display font-bold leading-none ${r.score >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                            {r.score.toFixed(1)}
                                        </span>
                                        <span className={`text-xs font-sans font-bold uppercase mt-1 ${r.score >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                            {r.score >= 5 ? 'Đạt' : 'Trượt'}
                                        </span>
                                    </div>
                                </div>
                            </LooseLeafCard>
                        </Link>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
