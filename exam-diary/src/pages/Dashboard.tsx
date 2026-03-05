import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getCurrentUser, getData } from '../lib/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
      return;
    }

    const allExams = getData('quizano_exams');
    setExams(allExams);
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exams.map((exam) => (
            <div key={exam.id} className="cursor-pointer group hover:-translate-y-2 transition-transform duration-300" onClick={() => navigate(`/exam/${exam.id}`)}>
              <LooseLeafCard holesCount={4} className="w-full" contentClassName="!p-0 !min-h-[250px]">
                <div className="flex flex-col h-full justify-between p-6">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-2xl font-display font-bold text-[var(--color-ink)] leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                      {exam.title}
                    </h4>
                    <p className="font-sans text-[var(--color-pencil)] text-lg line-clamp-3">
                      {exam.description}
                    </p>
                  </div>

                  <div className="flex flex-col mt-4 gap-4">
                    <div className="flex flex-row gap-2">
                      <span className="px-3 py-1 bg-white border border-[var(--color-paper-line)] rounded-md font-sans text-xs font-semibold text-[var(--color-ink)]">
                        {exam.duration} Phút
                      </span>
                      <span className={`px-3 py-1 rounded-md font-sans text-xs font-semibold ${exam.type === 'free' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {exam.type === 'free' ? 'Tự do' : 'Có thời hạn'}
                      </span>
                    </div>
                    <button className="w-full py-2 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-sans font-bold rounded-lg group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                      Bắt đầu thi
                    </button>
                  </div>
                </div>
              </LooseLeafCard>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
