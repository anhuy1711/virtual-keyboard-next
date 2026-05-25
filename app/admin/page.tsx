'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DashboardResponse,
  getDashboardAPI,
} from '@/app/services/dashboardService';

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

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
    if (!isAuthorized) return;

    fetchDashboard();
  }, [isAuthorized]);

  const fetchDashboard = async () => {
    try {
      setIsLoadingDashboard(true);

      const data = await getDashboardAPI();

      setDashboard(data);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SHIPPING':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const revenueData =
      dashboard?.revenueByMonth?.map((item) => ({
        month: item.month,
        revenue: Number(item.revenue || 0),
      })) || [];

  const orderStatusData =
      dashboard?.ordersByStatus?.map((item) => ({
        status: item.status,
        value: Number(item.value || 0),
      })) || [];

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
        <main className="w-full pb-20 md:pb-0 overflow-auto">
          <div className="admin-page space-y-6">
            {/* Header */}
            <section className="admin-section-header">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Tổng quan quản trị
                </p>
                <h1 className="admin-title mt-2">Bảng điều khiển</h1>
                <p className="admin-subtitle">
                  Tổng quan doanh thu, đơn hàng, sản phẩm và khách hàng trong hệ
                  thống.
                </p>
              </div>

              <button
                  type="button"
                  onClick={fetchDashboard}
                  disabled={isLoadingDashboard}
                  className="admin-btn-secondary"
              >
              <span className="material-symbols-outlined text-[18px]">
                refresh
              </span>
                {isLoadingDashboard ? 'Đang tải...' : 'Làm mới'}
              </button>
            </section>

            {isLoadingDashboard && !dashboard ? (
                <div className="admin-card p-12 text-center text-slate-500">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                  Đang tải dữ liệu dashboard...
                </div>
            ) : (
                <>
                  {/* Stats */}
                  <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <div className="admin-card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                            Doanh thu
                          </p>
                          <h2 className="mt-3 text-2xl font-extrabold text-blue-900">
                            {formatCurrency(dashboard?.totalRevenue)}
                          </h2>
                        </div>

                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        payments
                      </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                            Đơn hàng
                          </p>
                          <h2 className="mt-3 text-2xl font-extrabold text-blue-900">
                            {dashboard?.totalOrders ?? 0}
                          </h2>
                        </div>

                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        shopping_cart
                      </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                            Sản phẩm
                          </p>
                          <h2 className="mt-3 text-2xl font-extrabold text-blue-900">
                            {dashboard?.totalProducts ?? 0}
                          </h2>
                        </div>

                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <span className="material-symbols-outlined">
                        inventory_2
                      </span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                            Khách hàng
                          </p>
                          <h2 className="mt-3 text-2xl font-extrabold text-blue-900">
                            {dashboard?.totalUsers ?? 0}
                          </h2>
                        </div>

                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                          <span className="material-symbols-outlined">group</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Charts */}
                  <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="admin-card p-5 xl:col-span-2">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-lg font-bold text-blue-900">
                            Doanh thu theo tháng
                          </h3>
                          <p className="text-sm text-slate-500">
                            Tổng doanh thu từ các đơn hàng đã hoàn thành.
                          </p>
                        </div>
                      </div>

                      <div className="h-80">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000000}tr`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [
                                      formatCurrency(value),
                                      'Doanh thu',
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                              Chưa có dữ liệu doanh thu.
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-card p-5">
                      <h3 className="text-lg font-bold text-blue-900 mb-1">
                        Trạng thái đơn hàng
                      </h3>
                      <p className="text-sm text-slate-500 mb-5">
                        Số lượng đơn hàng theo từng trạng thái.
                      </p>

                      <div className="h-80">
                        {orderStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={orderStatusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="status"
                                    tick={{ fontSize: 11 }}
                                    interval={0}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500">
                              Chưa có dữ liệu đơn hàng.
                            </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Tables */}
                  <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="admin-table-wrapper">
                      <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-blue-900">
                          Đơn hàng gần đây
                        </h3>

                        <Link
                            href="/admin/orders"
                            className="text-sm font-bold text-blue-700 hover:underline"
                        >
                          Xem tất cả
                        </Link>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="admin-table">
                          <thead className="admin-table-head">
                          <tr>
                            <th className="admin-table-th">Mã đơn</th>
                            <th className="admin-table-th">Người dùng</th>
                            <th className="admin-table-th text-right">
                              Tổng tiền
                            </th>
                            <th className="admin-table-th text-right">
                              Trạng thái
                            </th>
                          </tr>
                          </thead>

                          <tbody className="divide-y divide-outline-variant/10">
                          {dashboard?.recentOrders?.length ? (
                              dashboard.recentOrders.map((order) => (
                                  <tr key={order.id} className="admin-table-row">
                                    <td className="admin-table-td">
                                      <div>
                                        <p className="font-bold text-blue-900">
                                          #{order.id}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          {formatDate(order.createdAt)}
                                        </p>
                                      </div>
                                    </td>

                                    <td className="admin-table-td text-sm text-slate-700">
                                      Người dùng #{order.userId}
                                    </td>

                                    <td className="admin-table-td text-sm text-right font-semibold">
                                      {formatCurrency(order.total)}
                                    </td>

                                    <td className="admin-table-td text-right">
                                <span
                                    className={`status-badge ${getStatusClass(
                                        order.status
                                    )}`}
                                >
                                  {order.status}
                                </span>
                                    </td>
                                  </tr>
                              ))
                          ) : (
                              <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-10 text-center text-slate-500"
                                >
                                  Chưa có đơn hàng gần đây.
                                </td>
                              </tr>
                          )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="admin-table-wrapper">
                      <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-blue-900">
                          Sản phẩm bán chạy
                        </h3>

                        <Link
                            href="/admin/inventory"
                            className="text-sm font-bold text-blue-700 hover:underline"
                        >
                          Xem kho hàng
                        </Link>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="admin-table">
                          <thead className="admin-table-head">
                          <tr>
                            <th className="admin-table-th">Sản phẩm</th>
                            <th className="admin-table-th text-right">Đã bán</th>
                            <th className="admin-table-th text-right">
                              Doanh thu
                            </th>
                          </tr>
                          </thead>

                          <tbody className="divide-y divide-outline-variant/10">
                          {dashboard?.topProducts?.length ? (
                              dashboard.topProducts.map((product) => (
                                  <tr
                                      key={product.productId}
                                      className="admin-table-row"
                                  >
                                    <td className="admin-table-td">
                                      <div>
                                        <p className="font-bold text-blue-900">
                                          {product.productName}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          ID: {product.productId}
                                        </p>
                                      </div>
                                    </td>

                                    <td className="admin-table-td text-right text-sm font-semibold">
                                      {product.sold}
                                    </td>

                                    <td className="admin-table-td text-right text-sm font-semibold">
                                      {formatCurrency(product.revenue)}
                                    </td>
                                  </tr>
                              ))
                          ) : (
                              <tr>
                                <td
                                    colSpan={3}
                                    className="px-6 py-10 text-center text-slate-500"
                                >
                                  Chưa có dữ liệu sản phẩm bán chạy.
                                </td>
                              </tr>
                          )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                </>
            )}
          </div>
        </main>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-around items-center py-3 border-t border-surface-container-highest z-50">
          <Link
              href="/admin"
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive('/admin') ? 'text-blue-900 font-bold' : 'text-slate-400'
              }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] uppercase font-label-sm mt-1">Tổng quan</span>
          </Link>

          <Link
              href="/admin/inventory"
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive('/admin/inventory')
                      ? 'text-blue-900 font-bold'
                      : 'text-slate-400'
              }`}
          >
            <span className="material-symbols-outlined">keyboard</span>
            <span className="text-[10px] uppercase font-label-sm mt-1">Sản phẩm</span>
          </Link>

          <Link
              href="/admin/orders"
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive('/admin/orders')
                      ? 'text-blue-900 font-bold'
                      : 'text-slate-400'
              }`}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-[10px] uppercase font-label-sm mt-1">Đơn hàng</span>
          </Link>

          <Link
              href="/admin/users"
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive('/admin/users')
                      ? 'text-blue-900 font-bold'
                      : 'text-slate-400'
              }`}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-[10px] uppercase font-label-sm mt-1">Người dùng</span>
          </Link>
        </nav>
      </div>
  );
}
