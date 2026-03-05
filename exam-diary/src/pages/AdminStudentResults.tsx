import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getData } from '../lib/mockData';

export default function AdminStudentResults() {
    const [results, setResults] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setResults(getData('quizano_results'));
        setExams(getData('quizano_exams'));
        setUsers(getData('quizano_users'));
    }, []);

    const getStudentName = (id: string) => users.find(u => u.id === id)?.fullName || 'Không rõ';
    const getUsername = (id: string) => users.find(u => u.id === id)?.username || '';
    const getExamName = (id: string) => exams.find(e => e.id === id)?.title || 'Không rõ';

    const filteredResults = results.filter(r => {
        const studentName = getStudentName(r.studentId).toLowerCase();
        const username = getUsername(r.studentId).toLowerCase();
        return studentName.includes(search.toLowerCase()) || username.includes(search.toLowerCase());
    });

    const formatDate = (isoStr: string) => {
        const d = new Date(isoStr);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <DashboardLayout isAdmin title="Kết Quả Sinh Viên">
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">

                <div className="flex flex-row justify-between items-center mb-4">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm kiếm theo Tên hoặc Mã SV..."
                            className="w-full px-6 py-3 border-2 border-[var(--color-ink)] rounded-full font-sans text-lg outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
                    </div>

                    <button className="px-6 py-3 border-2 border-[var(--color-ink)] text-[var(--color-ink)] font-sans font-bold rounded-lg hover:bg-[#2c2424] hover:text-white transition-colors">
                        Xuất Báo Cáo
                    </button>
                </div>

                <LooseLeafCard holesCount={7} className="overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left font-sans text-lg border-collapse">
                            <thead>
                                <tr className="border-b-2 border-dashed border-[var(--color-paper-line)] text-[var(--color-primary)] font-display text-xl">
                                    <th className="py-4 px-2 font-bold">MSV</th>
                                    <th className="py-4 px-2 font-bold">Kỳ thi</th>
                                    <th className="py-4 px-2 font-bold text-center">Điểm</th>
                                    <th className="py-4 px-2 font-bold text-right">Ngày nộp</th>
                                    <th className="py-4 px-2 font-bold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.map(r => (
                                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-2 flex flex-col">
                                            <span className="font-bold text-[var(--color-ink)]">{getStudentName(r.studentId)}</span>
                                            <span className="text-sm font-sans text-[var(--color-pencil)]">@{getUsername(r.studentId)}</span>
                                        </td>
                                        <td className="py-4 px-2 font-semibold text-[var(--color-ink)]">{getExamName(r.examId)}</td>
                                        <td className="py-4 px-2 text-center">
                                            <span className={`font-bold font-sans text-2xl ${r.score >= 5 ? 'text-green-600' : 'text-red-600'}`}>
                                                {r.score}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-sm text-[var(--color-pencil)] text-right">
                                            {formatDate(r.submitTime)}
                                        </td>
                                        <td className="py-4 px-2 text-right">
                                            <button className="text-[var(--color-primary)] font-bold hover:underline">
                                                Xem bài làm
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredResults.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-[var(--color-pencil)] font-sans italic">
                                            Không tìm thấy dữ liệu phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </LooseLeafCard>
            </div>
        </DashboardLayout>
    );
}
