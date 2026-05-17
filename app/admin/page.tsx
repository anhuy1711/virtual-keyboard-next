'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { logoutAPI } from '@/app/services/authService';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

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

      console.log('Admin check - Decoded token:', { role: userRole });

      if (userRole !== 'ADMIN') {
        console.log('User is not admin, redirecting to home');
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

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const handleLogout = () => {
    logoutAPI();
    toast.success('Đã đăng xuất!');
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  // Mock stats data
  const stats = [
    { label: 'Total Users', value: '2,842', change: '+12%', icon: 'group', positive: true },
    { label: 'Monthly Revenue', value: '$42,190', change: '+8.4%', icon: 'payments', positive: true },
    { label: 'Inventory Value', value: '$128,400', change: 'Stable', icon: 'inventory_2', positive: true },
  ];

  const chartData = [40, 65, 55, 85, 70, 45, 95, 55, 75, 100, 80];
  const maxValue = Math.max(...chartData);

  const recentActivities = [
    { id: 1, type: 'order', title: 'New order #8291', desc: 'Custom GMK Keycap Set • 2 mins ago', color: 'bg-secondary' },
    { id: 2, type: 'alert', title: 'Inventory Alert', desc: 'Lubricant Krytox 205g0 is low • 45 mins ago', color: 'bg-orange-400' },
    { id: 3, type: 'user', title: 'User Verified', desc: 'Alexander M. updated profile • 2 hrs ago', color: 'bg-emerald-400' },
    { id: 4, type: 'order', title: 'New order #8290', desc: 'Tofu60 Walnut Edition • 5 hrs ago', color: 'bg-secondary' },
  ];

  return (
    <div className="flex h-screen bg-surface-ivory">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="w-full pb-20 md:pb-0">
        {/* Top Header */}

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {/* Greeting & Date */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-h1 text-h1 text-primary">Atelier Overview</h2>
              <p className="font-body-md text-text-secondary mt-1">Status check for Elite Keyboards Workshop</p>
            </div>
            <div className="bg-surface-container px-4 py-2 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">calendar_today</span>
              <span className="font-label-md text-label-md text-secondary">October 24, 2023</span>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-surface-container-highest shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {stat.icon}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${stat.positive ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 bg-slate-50'}`}>
                    {stat.change}
                    <span className="material-symbols-outlined text-xs">{stat.positive ? 'arrow_upward' : 'horizontal_rule'}</span>
                  </span>
                </div>
                <p className="font-label-md text-label-md text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="font-h2 text-h2 text-blue-900 mt-1">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-surface-container-highest shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="font-h3 text-h3 text-blue-900">Revenue Performance</h4>
                  <p className="font-body-sm text-slate-500">Weekly breakdown of orders vs returns</p>
                </div>
                <select className="bg-surface-container-low border-none rounded-lg font-label-sm text-label-sm focus:ring-secondary px-3 py-1.5">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>

              <div className="h-64 flex items-end justify-between gap-2 px-2 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-slate-100 w-full"></div>
                  <div className="border-t border-slate-100 w-full"></div>
                  <div className="border-t border-slate-100 w-full"></div>
                  <div className="border-t border-slate-100 w-full"></div>
                </div>

                {chartData.map((value, index) => (
                  <div key={index} className="flex-1 bg-surface-container rounded-t-sm hover:bg-secondary-container transition-colors relative group cursor-pointer" style={{ height: `${(value / maxValue) * 100}%` }}>
                    <div className="bg-secondary w-full opacity-50 rounded-t-sm" style={{ height: `${(value / maxValue) * 60}%`, position: 'absolute', bottom: 0 }}></div>
                    {value === 100 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded whitespace-nowrap font-bold">$12.4k</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6 px-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Aug 2023</span>
                <span>Jul 2024</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8 rounded-xl border border-surface-container-highest shadow-sm">
              <h4 className="font-h3 text-h3 text-blue-900 mb-6">Recent Activity</h4>
              <div className="space-y-6">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${activity.color}`}></div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{activity.title}</p>
                      <p className="font-body-sm text-text-light text-xs">{activity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-2 border border-outline text-slate-600 rounded-lg font-label-md hover:bg-slate-50 transition-colors">
                View All Logs
              </button>
            </div>
          </div>

          {/* Product Spotlight */}

        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-around items-center py-3 border-t border-surface-container-highest z-50">
        <Link href="/admin" className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${isActive('/admin') ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] uppercase font-label-sm mt-1">Dash</span>
        </Link>
        <Link href="/admin/inventory" className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${isActive('/admin/inventory') ? 'text-blue-900 font-bold' : 'text-slate-400'}`}>
          <span className="material-symbols-outlined">keyboard</span>
          <span className="text-[10px] uppercase font-label-sm mt-1">Items</span>
        </Link>
        <Link href="#" className="flex flex-col items-center text-slate-400 py-2 px-4 rounded-lg">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="text-[10px] uppercase font-label-sm mt-1">Orders</span>
        </Link>
        <Link href="#" className="flex flex-col items-center text-slate-400 py-2 px-4 rounded-lg">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[10px] uppercase font-label-sm mt-1">Users</span>
        </Link>
      </nav>
    </div>
  );
}



