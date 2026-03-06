import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, ShieldCheck, User } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import LooseLeafCard from '../components/ui/LooseLeafCard';
import { getCurrentUser, getData, saveData, formatDate } from '../lib/mockData';

export default function AdminUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('student');

    useEffect(() => {
        const me = getCurrentUser();
        if (!me || me.role !== 'admin') { navigate('/admin/login'); return; }
        setUsers(getData('quizano_users'));
    }, [navigate]);

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchesSearch =
                u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                u.username?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilter === 'all' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, search, roleFilter]);

    const getResultCount = (userId: string) =>
        getData('quizano_results').filter((r: any) => r.studentId === userId).length;

    const handleDelete = (userId: string, username: string) => {
        const me = getCurrentUser();
        if (me?.id === userId) { alert('Bạn không thể tự xóa tài khoản của mình!'); return; }
        if (!confirm(`Xóa tài khoản "${username}"? Toàn bộ kết quả của người dùng này cũng sẽ bị xóa.`)) return;
        const newUsers = getData('quizano_users').filter((u: any) => u.id !== userId);
        saveData('quizano_users', newUsers);
        saveData('quizano_results', getData('quizano_results').filter((r: any) => r.studentId !== userId));
        setUsers(newUsers);
    };

    const toggleRole = (userId: string, currentRole: string) => {
        const me = getCurrentUser();
        if (me?.id === userId) { alert('Bạn không thể thay đổi vai trò của chính mình!'); return; }
        const newRole = currentRole === 'admin' ? 'student' : 'admin';
        if (!confirm(`Thay đổi vai trò của người dùng này thành "${newRole}"?`)) return;
        const newUsers = getData('quizano_users').map((u: any) =>
            u.id === userId ? { ...u, role: newRole } : u
        );
        saveData('quizano_users', newUsers);
        setUsers(newUsers);
    };

    return (
        <DashboardLayout isAdmin title="Quản lý Người Dùng">
            <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">

                {/* Filter bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-pencil)]" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, username, email..."
                            className="w-full pl-9 pr-4 py-2.5 border-2 border-dashed border-[var(--color-paper-line)] bg-white rounded-lg font-sans text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                    </div>
                    <div className="flex flex-row gap-2 shrink-0">
                        {(['all', 'student', 'admin'] as const).map(r => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-3 py-2 rounded-lg font-sans font-bold text-xs border-2 transition-colors ${roleFilter === r
                                        ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                                        : 'bg-white text-[var(--color-pencil)] border-[var(--color-paper-line)] hover:border-[var(--color-ink)]'
                                    }`}
                            >
                                {r === 'all' ? 'Tất cả' : r === 'student' ? '🎓 Sinh viên' : '🛡️ Admin'}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="font-sans text-sm text-[var(--color-pencil)]">
                    Hiển thị <strong>{filtered.length}</strong> / {users.length} người dùng
                </p>

                {/* Users table card */}
                <LooseLeafCard holesCount={6}>
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left font-sans text-sm">
                            <thead>
                                <tr className="border-b-2 border-dashed border-[var(--color-paper-line)]">
                                    <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider">STT</th>
                                    <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider">Người dùng</th>
                                    <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider hidden sm:table-cell">Email</th>
                                    <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider text-center">Vai trò</th>
                                    <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider text-center hidden md:table-cell">Lượt thi</th>
                                    <th className="py-3 px-2 font-bold text-[var(--color-pencil)] uppercase text-xs tracking-wider text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, idx) => (
                                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-2 text-center text-[var(--color-pencil)]">{idx + 1}</td>
                                        <td className="py-3 px-2">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[var(--color-ink)]">{u.fullName}</span>
                                                <span className="text-xs text-[var(--color-pencil)]">@{u.username}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-[var(--color-pencil)] hidden sm:table-cell">{u.email || '—'}</td>
                                        <td className="py-3 px-2 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs border ${u.role === 'admin'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                                                    : 'bg-blue-50 text-blue-700 border-blue-300'
                                                }`}>
                                                {u.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                                                {u.role === 'admin' ? 'Admin' : 'Sinh viên'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-center font-bold hidden md:table-cell">{getResultCount(u.id)}</td>
                                        <td className="py-3 px-2">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => toggleRole(u.id, u.role)}
                                                    title="Đổi vai trò"
                                                    className="p-1.5 rounded-md border border-[var(--color-paper-line)] hover:bg-gray-100 transition-colors text-[var(--color-pencil)] hover:text-[var(--color-ink)]"
                                                >
                                                    <ShieldCheck size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.id, u.username)}
                                                    title="Xóa người dùng"
                                                    className="p-1.5 rounded-md border border-red-200 hover:bg-red-50 transition-colors text-red-400 hover:text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-[var(--color-pencil)] font-sans italic">
                                            Không tìm thấy người dùng nào.
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
