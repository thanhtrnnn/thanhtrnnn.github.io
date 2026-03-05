import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingLayout from '../components/layout/LandingLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getData, setLogin } from '../lib/mockData';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const users = getData('quizano_users');
        const user = users.find((u: any) => u.username === username && u.password === password && u.role === 'admin');

        if (user) {
            setLogin(user);
            navigate('/admin');
        } else {
            setError('Tài khoản quản trị viên không chính xác!');
        }
    };

    return (
        <LandingLayout>
            <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-12">
                <h2 className="text-4xl sm:text-5xl font-display font-bold mb-12 text-center">
                    Cổng Quản Trị Hệ Thống
                </h2>

                {/* Auth Card */}
                <div className="w-full max-w-md transition-all duration-500 hover:scale-[1.02] -rotate-1 hover:-rotate-2">
                    <LooseLeafCard holesCount={4} className="min-h-[auto] !p-0">
                        <div className="flex flex-col h-full justify-center p-8">
                            <h3 className="text-2xl font-display font-bold mb-2">Đăng nhập Admin</h3>
                            <p className="text-[var(--color-pencil)] font-sans mb-8">Dành riêng cho giáo viên</p>

                            {error && <p className="text-red-500 font-sans mb-4 text-sm">{error}</p>}

                            <form onSubmit={handleLogin} className="flex flex-col gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="font-sans font-bold text-sm">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="border-b-2 border-dashed border-[var(--color-paper-line)] bg-transparent outline-none focus:border-[var(--color-primary)] font-sans text-xl px-2 py-1 transition-colors"
                                        placeholder="VD: admin"
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

                                <button type="submit" className="mt-4 bg-[#2c2424] hover:bg-[#1f1313] text-white font-sans font-bold text-lg py-3 rounded-xl shadow-md transition-transform hover:scale-105">
                                    Đăng nhập
                                </button>
                            </form>
                        </div>
                    </LooseLeafCard>
                </div>
            </div>
        </LandingLayout>
    );
}
