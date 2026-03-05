import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LandingLayout from '../components/layout/LandingLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getData, saveData, setLogin, generateId } from '../lib/mockData';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    const users = getData('quizano_users');
    if (users.find((u: any) => u.username === username)) {
      setError('Tên đăng nhập đã tồn tại!');
      return;
    }

    const newUser = {
      id: generateId("sv"),
      username,
      fullName,
      email,
      password,
      role: 'student'
    };

    saveData('quizano_users', [...users, newUser]);
    setLogin(newUser);
    navigate('/');
  };

  return (
    <LandingLayout>
      <div className="flex flex-col lg:flex-row items-center w-full max-w-6xl mx-auto justify-between gap-16 px-8">

        {/* Hero Section */}
        <div className="flex-1 max-w-lg mb-12 lg:mb-0 hidden lg:block">
          <div className="text-[var(--color-primary)] text-6xl font-note font-bold mb-4 leading-none">"</div>
          <h2 className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-6">
            Bắt đầu hành trình của bạn...
          </h2>
          <p className="text-xl font-sans text-[var(--color-pencil)] leading-relaxed">
            Tạo tài khoản ngay hôm nay để truy cập hệ thống thi cử và rèn luyện kiến thức hiệu quả.
          </p>
        </div>

        {/* Auth Card */}
        <div className="flex-1 w-full max-w-lg pb-12 transition-all duration-500 hover:scale-[1.02] -rotate-1 hover:-rotate-2">
          <LooseLeafCard holesCount={7}>
            <div className="flex flex-col py-4 w-full">
              <h3 className="text-3xl font-display font-bold mb-2">Đăng ký</h3>
              <p className="text-[var(--color-pencil)] font-sans mb-6">Tham gia cùng đội nhóm!</p>

              {error && <p className="text-red-500 font-sans mb-4 text-sm">{error}</p>}

              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-sans font-bold text-sm">Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none focus:border-[var(--color-primary)] font-sans text-lg px-2 py-1 transition-colors"
                    placeholder="Nguyễn Văn Học"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-sans font-bold text-sm">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none focus:border-[var(--color-primary)] font-sans text-lg px-2 py-1 transition-colors"
                    placeholder="hocsinh@mail.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-sans font-bold text-sm">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none focus:border-[var(--color-primary)] font-sans text-lg px-2 py-1 transition-colors"
                    placeholder="VD: nguyenvana"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 md:flex-row md:gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="font-sans font-bold text-sm">Mật khẩu</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none focus:border-[var(--color-primary)] font-sans text-lg px-2 py-1 transition-colors relative z-10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="font-sans font-bold text-sm">Xác nhận MK</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none focus:border-[var(--color-primary)] font-sans text-lg px-2 py-1 transition-colors relative z-10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="mt-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-bold text-lg py-3 rounded-xl shadow-[2px_4px_10px_#bd2e2e80] transition-transform hover:scale-105 z-10 cursor-pointer">
                  Đăng ký
                </button>
              </form>

              <p className="mt-8 text-center font-sans text-sm text-[var(--color-pencil)] relative z-10">
                Đã có tài khoản? <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline cursor-pointer">Đăng nhập</Link>
              </p>
            </div>
          </LooseLeafCard>
        </div>

      </div>
    </LandingLayout>
  );
}
