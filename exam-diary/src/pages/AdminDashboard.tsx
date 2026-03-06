import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getCurrentUser, getData, saveData } from '../lib/mockData';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [exams, setExams] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

    useEffect(() => {
        const user = getCurrentUser();
        if (!user || user.role !== 'admin') { navigate('/admin/login'); return; }
        setExams(getData('quizano_exams'));
    }, [navigate]);

    const filtered = useMemo(() => {
        return exams.filter(exam => {
            const matchesSearch =
                exam.title.toLowerCase().includes(search.toLowerCase()) ||
                exam.description?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [exams, search, statusFilter]);

    const handleEdit = (examId: string) => navigate(`/admin/exam/new?edit=${examId}`);

    const handleDelete = (examId: string, examTitle: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa kỳ thi "${examTitle}"?\nToàn bộ câu hỏi và kết quả liên quan cũng sẽ bị xóa.`)) return;
        const newExams = getData('quizano_exams').filter((e: any) => e.id !== examId);
        saveData('quizano_exams', newExams);
        saveData('quizano_questions', getData('quizano_questions').filter((q: any) => q.examId !== examId));
        saveData('quizano_results', getData('quizano_results').filter((r: any) => r.examId !== examId));
        setExams(newExams);
    };

    const getQuestionCount = (examId: string) =>
        getData('quizano_questions').filter((q: any) => q.examId === examId).length;

    const getResultCount = (examId: string) =>
        getData('quizano_results').filter((r: any) => r.examId === examId).length;

    return (
        <DashboardLayout isAdmin>
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-pencil)]" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm kiếm kỳ thi..."
                                className="w-full pl-9 pr-4 py-2.5 border-2 border-dashed border-[var(--color-paper-line)] bg-white rounded-lg font-sans text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                            />
                        </div>
                        <div className="flex flex-row gap-2 shrink-0">
                            {(['all', 'active', 'draft'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-2 rounded-lg font-sans font-bold text-xs border-2 transition-colors ${statusFilter === s
                                            ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                                            : 'bg-white text-[var(--color-pencil)] border-[var(--color-paper-line)] hover:border-[var(--color-ink)]'
                                        }`}
                                >
                                    {s === 'all' ? 'Tất cả' : s === 'active' ? '🟢 Đang mở' : '🟡 Nháp'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Link
                        to="/admin/exam/new"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-bold text-sm rounded-lg shadow-md transition-transform hover:scale-105 shrink-0"
                    >
                        <Plus size={16} /> Tạo kỳ thi
                    </Link>
                </div>

                {search && (
                    <p className="font-sans text-sm text-[var(--color-pencil)]">
                        Tìm thấy <strong>{filtered.length}</strong> kỳ thi
                    </p>
                )}

                {/* Exam list */}
                <div className="flex flex-col gap-4">
                    {filtered.map((exam) => (
                        <div key={exam.id}>
                            <LooseLeafCard holesCount={2} className="w-full" contentClassName="!p-0 !min-h-[auto]">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 gap-4 w-full">
                                    <div className="flex flex-col gap-2 flex-1 min-w-0">
                                        <h4 className="text-xl font-display font-bold text-[var(--color-ink)] truncate">{exam.title}</h4>
                                        <p className="font-sans text-[var(--color-pencil)] text-sm line-clamp-1">{exam.description}</p>
                                        <div className="flex flex-row gap-2 mt-1 flex-wrap">
                                            <span className="px-2.5 py-1 bg-white border border-[var(--color-paper-line)] rounded-md font-sans text-xs font-semibold text-[var(--color-ink)]">⏱ {exam.duration} phút</span>
                                            <span className="px-2.5 py-1 bg-white border border-[var(--color-paper-line)] rounded-md font-sans text-xs font-semibold text-[var(--color-ink)]">📝 {getQuestionCount(exam.id)} câu</span>
                                            <span className="px-2.5 py-1 bg-white border border-[var(--color-paper-line)] rounded-md font-sans text-xs font-semibold text-[var(--color-ink)]">📊 {getResultCount(exam.id)} lượt</span>
                                            <span className={`px-2.5 py-1 rounded-md font-sans text-xs font-semibold border ${exam.status === 'active' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'}`}>
                                                {exam.status === 'active' ? '🟢 Đang mở' : '🟡 Bản nháp'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2 shrink-0">
                                        <button onClick={() => handleEdit(exam.id)} className="px-4 py-2 border-2 border-[var(--color-ink)] text-[var(--color-ink)] font-sans font-bold text-xs rounded-lg hover:bg-[var(--color-ink)] hover:text-white transition-colors">
                                            Chỉnh sửa
                                        </button>
                                        <button onClick={() => handleDelete(exam.id, exam.title)} className="px-4 py-2 border-2 border-red-500 text-red-500 font-sans font-bold text-xs rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </LooseLeafCard>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-pencil)] font-sans text-base">
                            {search ? `Không tìm thấy kỳ thi nào khớp với "${search}".` : 'Chưa có kỳ thi nào.'}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
