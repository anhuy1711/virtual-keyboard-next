'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { logoutAPI } from '@/app/services/authService';

const menuItems = [
    {
        label: 'Tổng quan',
        href: '/admin',
        icon: 'dashboard',
    },
    {
        label: 'Kho',
        href: '/admin/inventory',
        icon: 'inventory_2',
    },
    {
        label: 'Danh mục',
        href: '/admin/categories',
        icon: 'category',
    },
    {
        label: 'Đơn hàng',
        href: '/admin/orders',
        icon: 'shopping_cart',
    },
    {
        label: 'Khách hàng',
        href: '/admin/users',
        icon: 'group',
    },
    {
        label: 'Nhân viên',
        href: '/admin/staffs',
        icon: 'group',
    },
    {
        label: 'Nhật ký',
        href: '/admin/audit-log',
        icon: 'assignment_turned_in',
    },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }

        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        logoutAPI();
        toast.success('Đã đăng xuất!');
        router.push('/');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-6 px-4 gap-5 z-50">
            {/* Brand */}
            <div className="flex items-center gap-3 px-1">
                <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-lg shrink-0">
          <span
              className="material-symbols-outlined text-white text-[19px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
          >
            architecture
          </span>
                </div>

                <div className="min-w-0">
                    <h1 className="font-headline text-lg font-bold tracking-tight text-primary leading-tight truncate">
                        Clack Keebs
                    </h1>
                    <p className="text-[10px] text-on-surface-variant opacity-70 uppercase tracking-wide">
                        CMS
                    </p>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex flex-col gap-1 flex-grow">
                {menuItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                active
                                    ? 'flex items-center gap-3 py-2.5 px-3 rounded-lg text-secondary font-bold border-r-4 border-secondary bg-surface-container-high active:scale-95 transition-all'
                                    : 'flex items-center gap-3 py-2.5 px-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors'
                            }
                        >
              <span
                  className="material-symbols-outlined text-[20px] shrink-0"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>

                            <span className="text-[12px] font-semibold tracking-wide uppercase">
                {item.label}
              </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-auto flex flex-col gap-1 pt-5 border-t border-outline-variant/10">
                <Link
                    href="/"
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm mb-3 shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    <span>Trang chủ</span>
                </Link>



                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        backgroundColor: "#fef2f2",
                        color: "#dc2626",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fee2e2";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fef2f2";
                    }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors text-left"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-[12px] font-semibold tracking-wide uppercase">
    Đăng xuất
  </span>
                </button>
            </div>
        </aside>
    );
}
