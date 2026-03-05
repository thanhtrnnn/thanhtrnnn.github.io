import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getData, saveData, generateId, getCurrentUser } from '../lib/mockData';
import { Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface QuestionOption {
    id: string;
    text: string;
}

interface Question {
    id: string;
    examId: string;
    content: string;
    options: QuestionOption[];
    correctOptionId: string;
    explanation: string;
}

export default function CreateExam() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editExamId = searchParams.get('edit');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState('60');
    const [status, setStatus] = useState('active');
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        const user = getCurrentUser();
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
            return;
        }

        if (editExamId) {
            const allExams = getData('quizano_exams');
            const exam = allExams.find((e: any) => e.id === editExamId);
            if (exam) {
                setTitle(exam.title);
                setDescription(exam.description);
                setDuration(exam.duration.toString());
                setStatus(exam.status);

                const allQuestions = getData('quizano_questions');
                const examQuestions = allQuestions
                    .filter((q: any) => q.examId === editExamId)
                    .map((q: any) => ({ ...q }));
                setQuestions(examQuestions);
            } else {
                navigate('/admin');
            }
        } else {
            addEmptyQuestion();
        }
    }, [editExamId, navigate]);

    const addEmptyQuestion = () => {
        const newQ: Question = {
            id: generateId('q'),
            examId: editExamId || 'temp',
            content: '',
            options: [
                { id: 'optA', text: '' },
                { id: 'optB', text: '' },
                { id: 'optC', text: '' },
                { id: 'optD', text: '' }
            ],
            correctOptionId: 'optA',
            explanation: ''
        };
        setQuestions(prev => [...prev, newQ]);
    };

    const removeQuestion = (index: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
        setQuestions(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        setQuestions(prev => {
            const updated = [...prev];
            (updated[index] as any)[field] = value;
            return updated;
        });
    };

    const updateOption = (qIndex: number, optIndex: number, text: string) => {
        setQuestions(prev => {
            const updated = [...prev];
            updated[qIndex].options[optIndex].text = text;
            return updated;
        });
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        setQuestions(prev => {
            const arr = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= arr.length) return arr;
            [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
            return arr;
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (questions.length === 0) {
            if (!confirm('Kỳ thi hiện tại chưa có câu hỏi nào. Bạn có chắc chắn muốn lưu?')) return;
        }

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.content.trim()) {
                alert(`Câu hỏi ${i + 1} chưa có nội dung.`);
                return;
            }
            const hasEmptyOption = q.options.some(opt => !opt.text.trim());
            if (hasEmptyOption) {
                alert(`Câu hỏi ${i + 1} có lựa chọn trống.`);
                return;
            }
        }

        const finalExamId = editExamId || generateId('exam');

        const examData = {
            id: finalExamId,
            title,
            description,
            type: 'free',
            duration: parseInt(duration),
            status
        };

        // Save exam
        const allExams = getData('quizano_exams');
        if (editExamId) {
            const idx = allExams.findIndex((e: any) => e.id === editExamId);
            if (idx !== -1) allExams[idx] = examData;
        } else {
            allExams.push(examData);
        }
        saveData('quizano_exams', allExams);

        // Save questions: remove old questions for this exam, add new ones
        const allQuestions = getData('quizano_questions');
        const otherQuestions = allQuestions.filter((q: any) => q.examId !== finalExamId);
        const finalQuestions = questions.map(q => ({ ...q, examId: finalExamId }));
        saveData('quizano_questions', [...otherQuestions, ...finalQuestions]);

        alert('Cập nhật thông tin kỳ thi thành công.');
        navigate('/admin');
    };

    return (
        <DashboardLayout isAdmin title={editExamId ? 'Chỉnh Sửa Kỳ Thi' : 'Tạo Kỳ Thi Mới'}>
            <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
                {/* Exam Info Card */}
                <LooseLeafCard holesCount={8}>
                    <div className="flex flex-col gap-6 w-full">
                        <h3 className="text-2xl font-display font-bold border-b-2 border-[var(--color-paper-line)] border-dashed pb-4 mb-2 text-[var(--color-ink)]">
                            Thông tin Kỳ Thi
                        </h3>

                        <form onSubmit={handleSave} id="examForm" className="flex flex-col gap-6 w-full">
                            <div className="flex flex-col gap-2">
                                <label className="font-sans font-bold text-sm uppercase text-[var(--color-pencil)]">Tên kỳ thi</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-b-2 border-[var(--color-ink)] bg-transparent outline-none font-display font-bold text-2xl py-2 focus:border-[var(--color-primary)] transition-colors placeholder:text-gray-300"
                                    placeholder="VD: Kiểm tra Toán Giữa Kỳ"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-sans font-bold text-sm uppercase text-[var(--color-pencil)]">Mô tả tóm tắt</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="border-2 border-dashed border-[var(--color-paper-line)] bg-white/50 rounded-lg outline-none font-sans text-lg p-4 min-h-[100px] focus:border-[var(--color-primary)] transition-colors resize-y"
                                    placeholder="Nhập mô tả cho kỳ thi này..."
                                    required
                                />
                            </div>

                            <div className="flex flex-row gap-8">
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="font-sans font-bold text-sm uppercase text-[var(--color-pencil)]">Thời gian (Phút)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none font-sans text-lg py-2 focus:border-[var(--color-primary)] transition-colors"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="font-sans font-bold text-sm uppercase text-[var(--color-pencil)]">Trạng thái</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none font-sans text-lg py-2 focus:border-[var(--color-primary)] transition-colors cursor-pointer appearance-none"
                                    >
                                        <option value="active">🟢 Đang Mở</option>
                                        <option value="draft">🟡 Bản Nháp</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                </LooseLeafCard>

                {/* Questions Editor */}
                <div className="flex flex-row justify-between items-center">
                    <h3 className="text-2xl font-display font-bold text-[var(--color-ink)]">
                        Câu hỏi ({questions.length})
                    </h3>
                    <button
                        type="button"
                        onClick={addEmptyQuestion}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-ink)] text-white font-sans font-bold text-sm rounded-lg hover:bg-[#1f1313] transition-colors"
                    >
                        <Plus size={16} /> Thêm câu hỏi
                    </button>
                </div>

                {questions.map((q, qIdx) => (
                    <div key={q.id}>
                        <LooseLeafCard holesCount={4} className="w-full">
                            <div className="flex flex-col gap-5 w-full">
                                {/* Question header */}
                                <div className="flex flex-row justify-between items-center">
                                    <span className="font-display font-bold text-lg text-[var(--color-primary)]">Câu hỏi {qIdx + 1}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => moveQuestion(qIdx, 'up')}
                                            disabled={qIdx === 0}
                                            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-all"
                                            title="Di chuyển lên"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveQuestion(qIdx, 'down')}
                                            disabled={qIdx === questions.length - 1}
                                            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-all"
                                            title="Di chuyển xuống"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(qIdx)}
                                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-all"
                                            title="Xóa câu hỏi"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Question content */}
                                <textarea
                                    value={q.content}
                                    onChange={(e) => updateQuestion(qIdx, 'content', e.target.value)}
                                    rows={2}
                                    className="border-2 border-dashed border-[var(--color-paper-line)] bg-white/50 rounded-lg outline-none font-sans text-base p-3 focus:border-[var(--color-primary)] transition-colors resize-y"
                                    placeholder="Nhập nội dung câu hỏi..."
                                />

                                {/* Options Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {q.options.map((opt, optIdx) => (
                                        <div key={opt.id} className="flex flex-col gap-1">
                                            <label className="font-sans font-bold text-xs text-[var(--color-pencil)] uppercase">
                                                Lựa chọn {String.fromCharCode(65 + optIdx)}
                                            </label>
                                            <input
                                                type="text"
                                                value={opt.text}
                                                onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                                                className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none font-sans text-base py-1.5 px-1 focus:border-[var(--color-primary)] transition-colors"
                                                placeholder={`Nội dung ${String.fromCharCode(65 + optIdx)}...`}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Correct Answer + Explanation */}
                                <div className="flex flex-row gap-6">
                                    <div className="flex flex-col gap-1 w-32">
                                        <label className="font-sans font-bold text-xs text-[var(--color-pencil)] uppercase">Đáp án đúng</label>
                                        <select
                                            value={q.correctOptionId}
                                            onChange={(e) => updateQuestion(qIdx, 'correctOptionId', e.target.value)}
                                            className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none font-sans text-base py-1.5 focus:border-[var(--color-primary)] cursor-pointer appearance-none font-bold text-green-600"
                                        >
                                            <option value="optA">A</option>
                                            <option value="optB">B</option>
                                            <option value="optC">C</option>
                                            <option value="optD">D</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className="font-sans font-bold text-xs text-[var(--color-pencil)] uppercase">Giải thích (tùy chọn)</label>
                                        <input
                                            type="text"
                                            value={q.explanation}
                                            onChange={(e) => updateQuestion(qIdx, 'explanation', e.target.value)}
                                            className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none font-sans text-base py-1.5 px-1 focus:border-[var(--color-primary)] transition-colors"
                                            placeholder="Nhập lời giải thích..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </LooseLeafCard>
                    </div>
                ))}

                {/* Action Buttons */}
                <div className="flex flex-row justify-between items-center border-t-2 border-dashed border-[var(--color-paper-line)] pt-8 pb-4">
                    <button
                        type="button"
                        onClick={addEmptyQuestion}
                        className="flex items-center gap-2 px-6 py-3 border-2 border-[var(--color-ink)] text-[var(--color-ink)] font-sans font-bold rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <Plus size={18} /> Thêm câu hỏi
                    </button>

                    <button
                        type="submit"
                        form="examForm"
                        className="px-10 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-bold text-lg rounded-xl shadow-md transition-transform hover:scale-105"
                    >
                        {editExamId ? 'Lưu Thay Đổi' : 'Tạo Kỳ Thi'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
