import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LandingLayout from '../components/layout/LandingLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getData, setLogin } from '../lib/mockData';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getData('quizano_users');
    const user = users.find((u: any) => u.username === username && u.password === password);

    if (user) {
      setLogin(user);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  return (
    <LandingLayout>
      <div className="flex flex-col lg:flex-row items-center w-full max-w-6xl mx-auto justify-between gap-16 px-8">

        {/* Hero Section */}
        <div className="flex-1 max-w-lg mb-12 lg:mb-0">
          <div className="text-[var(--color-primary)] text-6xl font-note font-bold mb-4 leading-none">"</div>
          <h2 className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-6">
            Mỗi kỳ thi là một câu chuyện...
          </h2>
          <p className="text-xl font-sans text-[var(--color-pencil)] leading-relaxed">
            Hãy viết tiếp trang sử của bạn. Đăng nhập để truy cập kho đề thi và theo dõi tiến độ học tập hàng ngày.
          </p>
        </div>

        {/* Auth Card */}
        <div className="flex-1 w-full max-w-lg transition-all duration-500 hover:scale-[1.02] -rotate-1 hover:-rotate-2">
          <LooseLeafCard holesCount={5}>
            <div className="flex flex-col h-full justify-center">
              <h3 className="text-3xl font-display font-bold mb-2">Đăng nhập</h3>
              <p className="text-[var(--color-pencil)] font-sans mb-8">Trở lại với bài học!</p>

              {error && <p className="text-red-500 font-sans mb-4 text-sm">{error}</p>}

              <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-sans font-bold text-sm">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none focus:border-[var(--color-primary)] font-sans text-xl px-2 py-1 transition-colors"
                    placeholder="VD: nguyenvana"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-sans font-bold text-sm">Mật khẩu</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none focus:border-[var(--color-primary)] font-sans text-xl px-2 py-1 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button type="submit" className="mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-bold text-lg py-3 rounded-xl shadow-md transition-transform hover:scale-105">
                  Đăng nhập
                </button>
              </form>

              <p className="mt-8 text-center font-sans text-sm text-[var(--color-pencil)]">
                Chưa có tài khoản? <Link to="/register" className="text-[var(--color-primary)] font-bold hover:underline">Đăng ký ở đây</Link>
              </p>
            </div>
          </LooseLeafCard>
        </div>

      </div>
    </LandingLayout>
  );
}
