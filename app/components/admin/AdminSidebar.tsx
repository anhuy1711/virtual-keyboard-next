'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { logoutAPI } from '@/app/services/authService';

const menuItems = [
    {
        label: 'Dashboard',
        href: '/admin',
        icon: 'dashboard',
    },
    {
        label: 'Inventory',
        href: '/admin/inventory',
        icon: 'inventory_2',
    },
    {
        label: 'Categories',
        href: '/admin/categories',
        icon: 'category',
    },
    {
        label: 'Orders',
        href: '/admin/orders',
        icon: 'shopping_cart',
    },
    {
        label: 'Users',
        href: '/admin/users',
        icon: 'group',
    },
    {
        label: 'Audit Log',
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
                        Digital Atelier
                    </h1>
                    <p className="text-[10px] text-on-surface-variant opacity-70 uppercase tracking-wide">
                        Management Console
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
                    className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 rounded-lg font-bold text-sm mb-3 shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    <span>Trang chủ</span>
                </Link>

                <Link
                    href="#"
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    <span className="text-[12px] font-semibold tracking-wide uppercase">
            Settings
          </span>
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors text-left"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span className="text-[12px] font-semibold tracking-wide uppercase">
            Log Out
          </span>
                </button>
            </div>
        </aside>
    );
}