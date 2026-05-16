'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { logoutAPI } from '@/app/services/authService';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';

interface AuditLog {
    id: number;
    date: string;
    time: string;
    adminName: string;
    action: AuditAction;
    target: string;
    description: string;
    ipAddress: string;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 1,
        date: '2026-05-16',
        time: '14:30:22',
        adminName: 'Hoàng Nam',
        action: 'CREATE',
        target: 'Sản phẩm: Neo98',
        description: 'ID: PRD-9982',
        ipAddress: '192.168.1.45',
    },
    {
        id: 2,
        date: '2026-05-16',
        time: '14:28:15',
        adminName: 'Minh Anh',
        action: 'UPDATE',
        target: 'Đơn hàng: #ORD-8829',
        description: 'Trạng thái: Đã giao',
        ipAddress: '113.20.145.2',
    },
    {
        id: 3,
        date: '2026-05-16',
        time: '13:10:05',
        adminName: 'Hoàng Nam',
        action: 'DELETE',
        target: 'Người dùng: Guest_882',
        description: 'Lý do: Spam',
        ipAddress: '192.168.1.45',
    },
    {
        id: 4,
        date: '2026-05-16',
        time: '09:00:12',
        adminName: 'Thúy Hạnh',
        action: 'LOGIN',
        target: 'Hệ thống',
        description: 'Trình duyệt: Chrome',
        ipAddress: '27.67.2.14',
    },
];

export default function AuditLogPage() {
    const router = useRouter();

    const [keyword, setKeyword] = useState('');
    const [adminFilter, setAdminFilter] = useState('ALL');
    const [actionFilter, setActionFilter] = useState<'ALL' | AuditAction>('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredLogs = useMemo(() => {
        return MOCK_AUDIT_LOGS.filter((log) => {
            const matchKeyword =
                !keyword.trim() ||
                log.adminName.toLowerCase().includes(keyword.toLowerCase()) ||
                log.target.toLowerCase().includes(keyword.toLowerCase()) ||
                log.description.toLowerCase().includes(keyword.toLowerCase()) ||
                log.ipAddress.toLowerCase().includes(keyword.toLowerCase());

            const matchAdmin =
                adminFilter === 'ALL' || log.adminName === adminFilter;

            const matchAction =
                actionFilter === 'ALL' || log.action === actionFilter;

            return matchKeyword && matchAdmin && matchAction;
        });
    }, [keyword, adminFilter, actionFilter]);

    const getActionClass = (action: AuditAction) => {
        switch (action) {
            case 'CREATE':
                return 'bg-emerald-50 text-emerald-700';
            case 'UPDATE':
                return 'bg-blue-50 text-blue-700';
            case 'DELETE':
                return 'bg-red-50 text-red-700';
            case 'LOGIN':
                return 'bg-slate-100 text-slate-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const handleLogout = () => {
        logoutAPI();
        toast.success('Đã đăng xuất!');
        router.push('/');
    };

    const handleViewDetail = (log: AuditLog) => {
        toast.info(`${log.action}: ${log.target}`);
    };

    const handleExportCsv = () => {
        toast.success('Đã xuất báo cáo CSV');
    };

    return (
        <div className="bg-surface text-on-surface flex min-h-screen">
            {/* Sidebar */}

            {/* Main */}
            <main className="flex-grow flex flex-col min-w-0">

                {/* Content */}
                <div className="ml-72 mt-16 p-12 px-24">
                    {/* Page Header */}
                    <div className="mb-10">
                        <div className="flex items-baseline gap-4 mb-2">
                            <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight">
                                Nhật ký hệ thống
                            </h2>
                            <span className="text-secondary font-headline text-xl font-light opacity-50">
                (Audit Log)
              </span>
                        </div>

                        <p className="text-on-surface-variant max-w-2xl font-light leading-relaxed">
                            Theo dõi và kiểm tra toàn bộ hoạt động của hệ thống. Dữ liệu ghi
                            lại lịch sử thay đổi từ cấu hình sản phẩm đến quản lý người dùng
                            để đảm bảo tính minh bạch và bảo mật.
                        </p>
                    </div>

                    {/* Filters */}
                    <section className="grid grid-cols-12 gap-6 mb-12">
                        <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-2xl flex flex-wrap items-center gap-6">
                            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Thời gian
                </span>

                                <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    calendar_today
                  </span>
                                    <input
                                        className="bg-transparent border-none text-sm font-medium focus:ring-0 w-48 text-on-surface"
                                        type="text"
                                        value="16/05/2026 - 23/05/2026"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Người dùng
                </span>

                                <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    person
                  </span>

                                    <select
                                        value={adminFilter}
                                        onChange={(e) => setAdminFilter(e.target.value)}
                                        className="bg-transparent border-none text-sm font-medium focus:ring-0 w-40 text-on-surface"
                                    >
                                        <option value="ALL">Tất cả Admin</option>
                                        <option value="Hoàng Nam">Hoàng Nam</option>
                                        <option value="Minh Anh">Minh Anh</option>
                                        <option value="Thúy Hạnh">Thúy Hạnh</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Loại hành động
                </span>

                                <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    bolt
                  </span>

                                    <select
                                        value={actionFilter}
                                        onChange={(e) =>
                                            setActionFilter(e.target.value as 'ALL' | AuditAction)
                                        }
                                        className="bg-transparent border-none text-sm font-medium focus:ring-0 w-32 text-on-surface"
                                    >
                                        <option value="ALL">Tất cả</option>
                                        <option value="CREATE">CREATE</option>
                                        <option value="UPDATE">UPDATE</option>
                                        <option value="DELETE">DELETE</option>
                                        <option value="LOGIN">LOGIN</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-4 bg-primary text-white p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                                    Dữ liệu hiện tại
                                </p>

                                <h3 className="font-headline text-3xl font-bold">
                                    {filteredLogs.length}{' '}
                                    <span className="text-sm font-normal opacity-70">
                    Sự kiện
                  </span>
                                </h3>
                            </div>

                            <button
                                onClick={handleExportCsv}
                                className="relative z-10 w-full mt-4 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
                                Xuất báo cáo (CSV)
                            </button>

                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-secondary opacity-20 blur-3xl rounded-full"></div>
                        </div>
                    </section>

                    {/* Table */}
                    <section className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="border-b border-outline-variant/10">
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Thời gian
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Quản trị viên
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Hành động
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Đối tượng tác động
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                        Địa chỉ IP
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">
                                        Chi tiết
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-outline-variant/5">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-8 py-12 text-center text-on-surface-variant"
                                        >
                                            Không có nhật ký nào phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-surface-container-low/50 transition-colors"
                                        >
                                            <td className="px-8 py-4">
                                                <p className="text-sm font-medium text-on-surface">
                                                    {log.date}
                                                </p>
                                                <p className="text-[10px] text-on-surface-variant">
                                                    {log.time}
                                                </p>
                                            </td>

                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center border border-outline-variant/20 font-bold text-xs">
                                                        {log.adminName.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-semibold">
                              {log.adminName}
                            </span>
                                                </div>
                                            </td>

                                            <td className="px-8 py-4">
                          <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getActionClass(
                                  log.action
                              )}`}
                          >
                            {log.action}
                          </span>
                                            </td>

                                            <td className="px-8 py-4">
                                                <p className="text-sm font-medium">{log.target}</p>
                                                <p className="text-[10px] text-on-surface-variant italic">
                                                    {log.description}
                                                </p>
                                            </td>

                                            <td className="px-8 py-4 text-xs font-mono text-on-surface-variant">
                                                {log.ipAddress}
                                            </td>

                                            <td className="px-8 py-4 text-right">
                                                <button
                                                    onClick={() => handleViewDetail(log)}
                                                    className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-secondary"
                                                >
                            <span className="material-symbols-outlined text-lg">
                              visibility
                            </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-8 py-6 flex items-center justify-between bg-surface-container-low/30 border-t border-outline-variant/10">
                            <p className="text-xs text-on-surface-variant">
                                Hiển thị{' '}
                                <span className="font-bold text-on-surface">
                  {filteredLogs.length}
                </span>{' '}
                                trên{' '}
                                <span className="font-bold text-on-surface">
                  {MOCK_AUDIT_LOGS.length}
                </span>{' '}
                                hành động
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors disabled:opacity-40"
                                >
                  <span className="material-symbols-outlined">
                    chevron_left
                  </span>
                                </button>

                                {[1, 2, 3].map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm ${
                                            currentPage === page
                                                ? 'bg-primary text-white'
                                                : 'hover:bg-surface-container-high text-on-surface-variant'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <span className="px-2 text-on-surface-variant">...</span>

                                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high text-on-surface-variant font-bold text-sm">
                                    32
                                </button>

                                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}