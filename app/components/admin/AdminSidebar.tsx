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
        <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-8 px-6 gap-8 z-50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
          <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
          >
            architecture
          </span>
                </div>

                <div>
                    <h1 className="font-headline text-xl font-bold tracking-tight text-primary">
                        Digital Atelier
                    </h1>
                    <p className="text-xs text-on-surface-variant opacity-70">
                        Management Console
                    </p>
                </div>
            </div>

            <nav className="flex flex-col gap-1 flex-grow">
                {menuItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={
                                active
                                    ? 'flex items-center gap-4 py-3 px-4 rounded-xl text-secondary font-bold border-r-4 border-secondary bg-surface-container-high active:scale-95 transition-all'
                                    : 'flex items-center gap-4 py-3 px-4 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors'
                            }
                        >
              <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>

                            <span className="text-label-md tracking-widest uppercase">
                {item.label}
              </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto flex flex-col gap-1 pt-8 border-t border-outline-variant/10">
                <Link
                    href="/"
                    className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-bold mb-4 shadow-lg flex items-center justify-center gap-2"
                >
                    <span>Trang chủ</span>
                </Link>

                <Link
                    href="#"
                    className="flex items-center gap-4 py-3 px-4 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-label-md tracking-widest uppercase">
            Settings
          </span>
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-4 py-3 px-4 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors text-left"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-label-md tracking-widest uppercase">
            Log Out
          </span>
                </button>
            </div>
        </aside>
    );
}