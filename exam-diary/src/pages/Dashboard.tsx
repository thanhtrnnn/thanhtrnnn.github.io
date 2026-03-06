import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getCurrentUser, getData } from '../lib/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate('/login'); return; }
    if (user.role === 'admin') { navigate('/admin'); return; }
    setExams(getData('quizano_exams'));
  }, [navigate]);

  const filtered = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch =
        exam.title.toLowerCase().includes(search.toLowerCase()) ||
        exam.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [exams, search, statusFilter]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
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
                className={`px-4 py-2 rounded-lg font-sans font-bold text-sm border-2 transition-colors ${statusFilter === s
                    ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                    : 'bg-white text-[var(--color-pencil)] border-[var(--color-paper-line)] hover:border-[var(--color-ink)]'
                  }`}
              >
                {s === 'all' ? 'Tất cả' : s === 'active' ? '🟢 Đang mở' : '🟡 Nháp'}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {search && (
          <p className="font-sans text-sm text-[var(--color-pencil)]">
            Tìm thấy <strong>{filtered.length}</strong> kỳ thi
          </p>
        )}

        {/* Exam grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((exam) => (
            <div
              key={exam.id}
              className="cursor-pointer group hover:-translate-y-2 transition-transform duration-300"
              onClick={() => navigate(`/exam/${exam.id}`)}
            >
              <LooseLeafCard holesCount={4} className="w-full" contentClassName="!p-0 !min-h-[220px]">
                <div className="flex flex-col h-full justify-between p-5">
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xl font-display font-bold text-[var(--color-ink)] leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                      {exam.title}
                    </h4>
                    <p className="font-sans text-[var(--color-pencil)] text-base line-clamp-3">
                      {exam.description}
                    </p>
                  </div>
                  <div className="flex flex-col mt-4 gap-3">
                    <div className="flex flex-row gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-white border border-[var(--color-paper-line)] rounded-md font-sans text-xs font-semibold text-[var(--color-ink)]">
                        ⏱ {exam.duration} phút
                      </span>
                      <span className={`px-3 py-1 rounded-md font-sans text-xs font-semibold border ${exam.status === 'active' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-yellow-50 text-yellow-700 border-yellow-300'}`}>
                        {exam.status === 'active' ? '🟢 Đang mở' : '🟡 Bản nháp'}
                      </span>
                    </div>
                    <button className="w-full py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-sans font-bold rounded-lg group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors text-sm">
                      Bắt đầu thi
                    </button>
                  </div>
                </div>
              </LooseLeafCard>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--color-pencil)] font-sans text-lg">
            {search ? `Không tìm thấy kỳ thi nào khớp với "${search}".` : 'Chưa có kỳ thi nào.'}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
