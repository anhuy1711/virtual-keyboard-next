'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
    AuditAction,
    AuditLogResponse,
    getAuditLogsAPI,
    SimplePage,
} from '@/app/services/auditLogService';

export default function AuditLogPage() {
    const router = useRouter();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const [logs, setLogs] = useState<AuditLogResponse[]>([]);
    const [pageData, setPageData] = useState<SimplePage<AuditLogResponse> | null>(
        null
    );
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    const [actorName, setActorName] = useState('');
    const [selectedAction, setSelectedAction] = useState<AuditAction | ''>('');
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const token = localStorage.getItem('accessToken');

        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token) as { role?: string };
            const userRole = decoded.role?.toUpperCase();

            if (userRole !== 'ADMIN') {
                router.push('/');
                return;
            }

            setIsAuthorized(true);
        } catch (error) {
            console.error('Invalid token:', error);
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    }, [router, isMounted]);

    useEffect(() => {
        if (isAuthorized) {
            fetchAuditLogs(0);
        }
    }, [isAuthorized]);

    const fetchAuditLogs = async (page: number = 0) => {
        try {
            setIsLoadingLogs(true);

            const response = await getAuditLogsAPI({
                action: selectedAction || undefined,
                actorName: actorName.trim() || undefined,
                page,
                size: 20,
            });

            setLogs(response.content || []);
            setPageData(response);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            toast.error('Lỗi khi tải nhật ký hệ thống');
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAuditLogs(0);
    };

    const handleReset = () => {
        setActorName('');
        setSelectedAction('');
        setCurrentPage(0);

        setTimeout(() => {
            fetchAuditLogs(0);
        }, 0);
    };

    const getActionClass = (action: string) => {
        switch (action) {
            case 'CREATE':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'UPDATE':
            case 'UPDATE_STATUS':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DELETE':
            case 'CANCEL_ORDER':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'LOGIN':
            case 'LOGOUT':
                return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'CHECKOUT':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const formatDate = (value?: string | null) => {
        if (!value) return { date: '-', time: '-' };

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            const [rawDate, rawTime] = value.split('T');
            return {
                date: rawDate || value,
                time: rawTime?.slice(0, 8) || '-',
            };
        }

        return {
            date: date.toLocaleDateString('vi-VN'),
            time: date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            }),
        };
    };

    const handleViewDetail = (log: AuditLogResponse) => {
        toast.info(`${log.action}: ${log.target}`);
    };

    if (!isMounted || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-on-surface-variant">
                        Đang kiểm tra quyền truy cập...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="flex h-screen bg-surface-ivory">
            <main className="w-full pb-20 md:pb-0">
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Title Section */}
                    <section className="flex justify-between items-end mb-8">
                        <div>
                            <nav className="flex mb-2">
                                <ol className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-slate-400 font-label">
                                    <li>
                                        <Link href="/admin" className="hover:text-primary">
                                            Admin
                                        </Link>
                                    </li>
                                    <li>
                    <span className="material-symbols-outlined text-[12px]">
                      chevron_right
                    </span>
                                    </li>
                                    <li>
                                        <span className="text-primary font-bold">Audit Log</span>
                                    </li>
                                </ol>
                            </nav>

                            <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 leading-none">
                                Audit Log
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Theo dõi thời gian, người thực hiện, hành động và đối tượng bị
                                tác động trong hệ thống.
                            </p>
                        </div>
                    </section>

                    {/* Filter */}
                    <section className="mb-8 bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
                        <form
                            onSubmit={handleSearch}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                        >
                            <div className="md:col-span-2">
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                    Người thực hiện
                                </label>
                                <input
                                    value={actorName}
                                    onChange={(e) => setActorName(e.target.value)}
                                    className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="VD: Hoàng Nam"
                                    type="text"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                    Hành động
                                </label>
                                <select
                                    value={selectedAction}
                                    onChange={(e) =>
                                        setSelectedAction(e.target.value as AuditAction | '')
                                    }
                                    className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="CREATE">CREATE</option>
                                    <option value="UPDATE">UPDATE</option>
                                    <option value="DELETE">DELETE</option>
                                    <option value="LOGIN">LOGIN</option>
                                    <option value="LOGOUT">LOGOUT</option>
                                    <option value="CHECKOUT">CHECKOUT</option>
                                    <option value="CANCEL_ORDER">CANCEL_ORDER</option>
                                    <option value="UPDATE_STATUS">UPDATE_STATUS</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="h-11 flex-1 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
                                >
                                    Lọc
                                </button>

                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="h-11 px-4 rounded-lg border border-outline-variant text-slate-500 text-sm font-bold hover:bg-surface-container-low transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Table */}
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/10">
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Thời gian
                                </th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Người thực hiện
                                </th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Hành động
                                </th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Đối tượng tác động
                                </th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Mô tả
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-outline-variant/10">
                            {isLoadingLogs ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            Đang tải nhật ký hệ thống...
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => {
                                    const { date, time } = formatDate(log.performedAt);

                                    return (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-surface-container/30 transition-colors group"
                                        >
                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <p className="font-bold text-blue-900">{date}</p>
                                                <p className="text-xs text-slate-400">{time}</p>
                                            </td>

                                            <td className="px-8 py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="font-bold text-blue-900">
                                                            {log.actorName || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            ID: {log.actorId || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-8 py-6">
                          <span
                              className={`inline-flex px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getActionClass(
                                  log.action
                              )}`}
                          >
                            {log.action}
                          </span>
                                            </td>

                                            <td className="px-8 py-6">
                                                <p className="font-bold text-blue-900">
                                                    {log.target}
                                                </p>
                                            </td>

                                            <td className="px-8 py-6 min-w-[280px]">
                                                <p className="text-sm text-slate-500">
                                                    {log.description || '-'}
                                                </p>

                                                {log.ipAddress && (
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        IP: {log.ipAddress}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500">
                                        Không có nhật ký nào
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-8 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/10">
                            <p className="text-xs text-slate-500">
                                {logs.length} / {pageData?.totalElements ?? 0}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage <= 0}
                                    onClick={() => fetchAuditLogs(currentPage - 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 hover:bg-surface-container-lowest transition-colors disabled:opacity-50"
                                >
                  <span className="material-symbols-outlined text-sm">
                    chevron_left
                  </span>
                                </button>

                                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">
                                    {currentPage + 1}
                                </button>

                                <button
                                    disabled={pageData ? currentPage + 1 >= pageData.totalPages : true}
                                    onClick={() => fetchAuditLogs(currentPage + 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 hover:bg-surface-container-lowest transition-colors disabled:opacity-50"
                                >
                  <span className="material-symbols-outlined text-sm">
                    chevron_right
                  </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-around items-center py-3 border-t border-surface-container-highest z-50">
                <Link
                    href="/admin"
                    className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-slate-400"
                >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Dash</span>
                </Link>

                <Link
                    href="/admin/inventory"
                    className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-slate-400"
                >
                    <span className="material-symbols-outlined">keyboard</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Items</span>
                </Link>

                <Link
                    href="/admin/audit-log"
                    className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-blue-900 font-bold"
                >
          <span className="material-symbols-outlined">
            assignment_turned_in
          </span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Logs</span>
                </Link>
            </nav>
        </div>
    );
}