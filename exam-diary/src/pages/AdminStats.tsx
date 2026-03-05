import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getData } from '../lib/mockData';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function formatDate(dateString: string) {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function AdminStats() {
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalExams, setTotalExams] = useState(0);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [avgScore, setAvgScore] = useState(0);
    const [passRate, setPassRate] = useState(0);
    const [distList, setDistList] = useState([0, 0, 0, 0, 0]);
    const [filterExamId, setFilterExamId] = useState('all');
    const [exams, setExams] = useState<any[]>([]);
    const [recentResults, setRecentResults] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allExams, setAllExams] = useState<any[]>([]);

    useEffect(() => {
        const users = getData('quizano_users');
        const examsData = getData('quizano_exams');
        setAllUsers(users);
        setAllExams(examsData);
        setExams(examsData);
        setTotalStudents(users.filter((u: any) => u.role === 'student').length);
        setTotalExams(examsData.length);
    }, []);

    useEffect(() => {
        const allResults = getData('quizano_results');

        const filtered = filterExamId === 'all'
            ? allResults
            : allResults.filter((r: any) => r.examId === filterExamId);

        setTotalSubmissions(filtered.length);

        let sumScore = 0;
        let passCount = 0;
        const dist = [0, 0, 0, 0, 0];

        filtered.sort((a: any, b: any) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());

        for (const r of filtered) {
            sumScore += r.score;
            if (r.score >= 5.0) passCount++;

            if (r.score < 3.0) dist[0]++;
            else if (r.score < 5.0) dist[1]++;
            else if (r.score < 7.0) dist[2]++;
            else if (r.score < 9.0) dist[3]++;
            else dist[4]++;
        }

        setDistList(dist);
        setAvgScore(filtered.length > 0 ? sumScore / filtered.length : 0);
        setPassRate(filtered.length > 0 ? (passCount / filtered.length) * 100 : 0);
        setRecentResults(filtered.slice(0, 50));
    }, [filterExamId]);

    const getStudentName = (id: string) => {
        const user = allUsers.find((u: any) => u.id === id);
        return user ? `${user.fullName} (${user.username})` : 'Tài khoản không tồn tại';
    };

    const getExamName = (id: string) => {
        const exam = allExams.find((e: any) => e.id === id);
        return exam ? exam.title : 'Kỳ thi đã xóa';
    };

    const barData = {
        labels: ['Yếu (<3đ)', 'Kém (3-4.9đ)', 'TB (5-6.9đ)', 'Khá (7-8.9đ)', 'Giỏi (≥9đ)'],
        datasets: [{
            label: 'Số lượng bài thi',
            data: distList,
            backgroundColor: [
                'rgba(220, 53, 69, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(0, 123, 255, 0.7)',
                'rgba(40, 167, 69, 0.7)',
                'rgba(111, 66, 193, 0.7)'
            ],
            borderColor: [
                'rgb(220, 53, 69)',
                'rgb(255, 193, 7)',
                'rgb(0, 123, 255)',
                'rgb(40, 167, 69)',
                'rgb(111, 66, 193)'
            ],
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, font: { family: 'Momo Trust Sans, sans-serif' } },
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                ticks: { font: { family: 'Momo Trust Sans, sans-serif', size: 11 } },
                grid: { display: false }
            }
        }
    };

    const doughnutData = {
        labels: ['Đạt (≥5đ)', 'Trượt (<5đ)'],
        datasets: [{
            data: [
                distList[2] + distList[3] + distList[4],
                distList[0] + distList[1]
            ],
            backgroundColor: ['rgba(40, 167, 69, 0.8)', 'rgba(220, 53, 69, 0.6)'],
            borderWidth: 2,
            borderColor: ['rgb(40, 167, 69)', 'rgb(220, 53, 69)']
        }]
    };

    return (
        <DashboardLayout isAdmin title="Thống Kê Tổng Quan">
            <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <LooseLeafCard holesCount={2} className="w-full bg-yellow-50/50" contentClassName="!p-4 sm:!p-6 !min-h-[200px] flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center text-center w-full">
                            <span className="text-[var(--color-pencil)] font-sans font-bold text-sm uppercase tracking-widest mb-4">Tổng Sinh Viên</span>
                            <span className="text-7xl font-note font-bold text-[var(--color-ink)]">{totalStudents}</span>
                        </div>
                    </LooseLeafCard>

                    <LooseLeafCard holesCount={2} className="w-full bg-blue-50/50" contentClassName="!p-4 sm:!p-6 !min-h-[200px] flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center text-center w-full">
                            <span className="text-[var(--color-pencil)] font-sans font-bold text-sm uppercase tracking-widest mb-4">Kỳ Thi Đang Mở</span>
                            <span className="text-7xl font-note font-bold text-blue-600">{totalExams}</span>
                        </div>
                    </LooseLeafCard>

                    <LooseLeafCard holesCount={2} className="w-full bg-green-50/50" contentClassName="!p-4 sm:!p-6 !min-h-[200px] flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center text-center w-full">
                            <span className="text-[var(--color-pencil)] font-sans font-bold text-sm uppercase tracking-widest mb-4">Lượt Nộp Bài</span>
                            <span className="text-7xl font-note font-bold text-green-600">{totalSubmissions}</span>
                        </div>
                    </LooseLeafCard>
                </div>

                {/* Filter */}
                <div className="flex flex-row items-center gap-4">
                    <label className="font-sans font-bold text-sm uppercase text-[var(--color-pencil)]">Lọc theo kỳ thi:</label>
                    <select
                        value={filterExamId}
                        onChange={(e) => setFilterExamId(e.target.value)}
                        className="border-2 border-dashed border-[var(--color-paper-line)] bg-white rounded-lg px-4 py-2 font-sans text-sm focus:border-[var(--color-primary)] outline-none cursor-pointer"
                    >
                        <option value="all">Tất cả kỳ thi</option>
                        {exams.map((ex) => (
                            <option key={ex.id} value={ex.id}>{ex.title}</option>
                        ))}
                    </select>
                </div>

                {/* Computed Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-[var(--color-pencil)] mb-2">Tổng lượt thi</span>
                        <span className="text-4xl font-display font-bold text-[var(--color-ink)]">{totalSubmissions}</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-[var(--color-pencil)] mb-2">Điểm trung bình</span>
                        <span className="text-4xl font-display font-bold text-blue-600">{avgScore.toFixed(2)}</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                        <span className="font-sans font-bold text-xs uppercase tracking-wider text-[var(--color-pencil)] mb-2">Tỷ lệ đạt</span>
                        <span className="text-4xl font-display font-bold text-green-600">{passRate.toFixed(1)}%</span>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <LooseLeafCard holesCount={6} className="lg:col-span-2">
                        <div className="flex flex-col w-full">
                            <h3 className="text-xl font-display font-bold border-b-2 border-dashed border-[var(--color-paper-line)] pb-4 mb-6">
                                Phân phối điểm số
                            </h3>
                            <div className="w-full h-[300px]">
                                <Bar data={barData} options={barOptions} />
                            </div>
                        </div>
                    </LooseLeafCard>

                    <LooseLeafCard holesCount={3}>
                        <div className="flex flex-col w-full items-center">
                            <h3 className="text-xl font-display font-bold border-b-2 border-dashed border-[var(--color-paper-line)] pb-4 mb-6 w-full">
                                Tỷ lệ Đạt/Trượt
                            </h3>
                            <div className="w-full max-w-[250px] h-[250px] flex items-center justify-center">
                                <Doughnut
                                    data={doughnutData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { font: { family: 'Momo Trust Sans, sans-serif' } } }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </LooseLeafCard>
                </div>

                {/* Results Table */}
                <LooseLeafCard holesCount={6}>
                    <div className="flex flex-col w-full">
                        <h3 className="text-xl font-display font-bold border-b-2 border-dashed border-[var(--color-paper-line)] pb-4 mb-6">
                            Kết quả gần đây (tối đa 50)
                        </h3>

                        {recentResults.length === 0 ? (
                            <div className="text-center py-12 text-[var(--color-pencil)] font-sans text-lg">
                                Hệ thống chưa ghi nhận lượt tham gia nào cho bộ lọc này.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-sans text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-[var(--color-paper-line)]">
                                            <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider">STT</th>
                                            <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider">Sinh viên</th>
                                            <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider">Kỳ thi</th>
                                            <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider">Ngày nộp</th>
                                            <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider text-center">Đúng</th>
                                            <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider text-center">Điểm</th>
                                            <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider text-center">Đánh giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentResults.map((r, idx) => (
                                            <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-2 text-center">{idx + 1}</td>
                                                <td className="py-3 px-2">{getStudentName(r.studentId)}</td>
                                                <td className="py-3 px-2">{getExamName(r.examId)}</td>
                                                <td className="py-3 px-2">{formatDate(r.submitTime)}</td>
                                                <td className="py-3 px-2 text-center">{r.correctCount}/{r.totalQuestions}</td>
                                                <td className="py-3 px-2 text-center font-bold">{r.score.toFixed(2)}</td>
                                                <td className="py-3 px-2 text-center">
                                                    {r.score >= 5.0
                                                        ? <span className="text-green-600 font-bold">Đạt</span>
                                                        : <span className="text-red-600 font-bold">Trượt</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </LooseLeafCard>
            </div>
        </DashboardLayout>
    );
}
