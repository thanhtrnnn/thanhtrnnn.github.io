import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getCurrentUser, getData, saveData } from '../lib/mockData';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
            return;
        }
        setExams(getData('quizano_exams'));
    }, [navigate]);

    const handleEdit = (examId: string) => {
        navigate(`/admin/exam/new?edit=${examId}`);
    };

    const handleDelete = (examId: string, examTitle: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa kỳ thi "${examTitle}"?\nToàn bộ câu hỏi và kết quả liên quan cũng sẽ bị xóa.`)) {
            return;
        }

        // Delete exam
        const allExams = getData('quizano_exams');
        const newExams = allExams.filter((e: any) => e.id !== examId);
        saveData('quizano_exams', newExams);

        // Delete all questions of this exam
        const allQuestions = getData('quizano_questions');
        const newQuestions = allQuestions.filter((q: any) => q.examId !== examId);
        saveData('quizano_questions', newQuestions);

        // Delete all results of this exam
        const allResults = getData('quizano_results');
        const newResults = allResults.filter((r: any) => r.examId !== examId);
        saveData('quizano_results', newResults);

        setExams(newExams);
    };

    const getQuestionCount = (examId: string) => {
        const allQuestions = getData('quizano_questions');
        return allQuestions.filter((q: any) => q.examId === examId).length;
    };

    const getResultCount = (examId: string) => {
        const allResults = getData('quizano_results');
        return allResults.filter((r: any) => r.examId === examId).length;
    };

    return (
        <DashboardLayout isAdmin>
            <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">

                <div className="flex flex-row justify-between items-center mb-4">
                    <h3 className="text-4xl font-display font-bold text-[var(--color-ink)]"></h3>
                    <Link to="/admin/exam/new" className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-bold rounded-lg shadow-md transition-transform hover:scale-105">
                        Tạo Kỳ Thi Mới
                    </Link>
                </div>

                <div className="flex flex-col gap-6">
                    {exams.map((exam) => (
                        <div key={exam.id}>
                            <LooseLeafCard holesCount={2} className="w-full" contentClassName="!p-0 !min-h-[auto]">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 gap-6 w-full">
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-2xl font-display font-bold text-[var(--color-ink)]">{exam.title}</h4>
                                        <p className="font-sans text-[var(--color-pencil)] text-lg line-clamp-2">{exam.description}</p>
                                        <div className="flex flex-row gap-2 mt-2 flex-wrap">
                                            <span className="px-3 py-1 bg-white border border-[var(--color-paper-line)] rounded-md font-sans text-xs font-semibold text-[var(--color-ink)]">
                                                ⏱ {exam.duration} phút
                                            </span>
                                            <span className="px-3 py-1 bg-white border border-[var(--color-paper-line)] rounded-md font-sans text-xs font-semibold text-[var(--color-ink)]">
                                                📝 {getQuestionCount(exam.id)} câu hỏi
                                            </span>
                                            <span className="px-3 py-1 bg-white border border-[var(--color-paper-line)] rounded-md font-sans text-xs font-semibold text-[var(--color-ink)]">
                                                📊 {getResultCount(exam.id)} lượt thi
                                            </span>
                                            <span className={`px-3 py-1 rounded-md font-sans text-xs font-semibold ${exam.status === 'active' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'}`}>
                                                {exam.status === 'active' ? '🟢 Đang mở' : '🟡 Bản nháp'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-row gap-3 shrink-0">
                                        <button
                                            onClick={() => handleEdit(exam.id)}
                                            className="px-5 py-2 border-2 border-[var(--color-ink)] text-[var(--color-ink)] font-sans font-bold text-sm rounded-lg hover:bg-[#2c2424] hover:text-white transition-colors"
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exam.id, exam.title)}
                                            className="px-5 py-2 border-2 border-red-500 text-red-500 font-sans font-bold text-sm rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </LooseLeafCard>
                        </div>
                    ))}
                    {exams.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-pencil)] font-sans text-lg">Chưa có kỳ thi nào.</div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
