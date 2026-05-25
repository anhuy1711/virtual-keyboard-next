'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
    CustomerResponse,
    getCustomersAPI,
    SimplePage,
    createUserByAdminAPI,
    Role,
    getStaffsAPI,
} from '@/app/services/userService';

export default function UsersPage() {
    const router = useRouter();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const [customers, setCustomers] = useState<CustomerResponse[]>([]);
    const [pageData, setPageData] = useState<SimplePage<CustomerResponse> | null>(
        null
    );
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [currentPage, setCurrentPage] = useState(0);

    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const [createUsername, setCreateUsername] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createFullName, setCreateFullName] = useState('');
    const [createPhone, setCreatePhone] = useState('');
    const [createAddress, setCreateAddress] = useState('');
    const [createBirthday, setCreateBirthday] = useState('');
    const [createRole, setCreateRole] = useState<Role>('STAFF');

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
            fetchCustomers(0);
        }
    }, [isAuthorized]);

    const fetchCustomers = async (page: number = 0) => {
        try {
            setIsLoadingCustomers(true);

            const response = await getStaffsAPI(
                {
                    fullName,
                    username,
                    email,
                    phone,
                },
                page,
                20
            );

            setCustomers(response.content || []);
            setPageData(response);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Lỗi khi tải danh sách khách hàng');
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    const resetCreateUserForm = () => {
        setCreateUsername('');
        setCreateEmail('');
        setCreatePassword('');
        setCreateFullName('');
        setCreatePhone('');
        setCreateAddress('');
        setCreateBirthday('');
        setCreateRole('STAFF');
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!createUsername.trim()) {
            toast.warning('Vui lòng nhập username');
            return;
        }

        if (!createEmail.trim()) {
            toast.warning('Vui lòng nhập email');
            return;
        }

        if (!createPassword.trim()) {
            toast.warning('Vui lòng nhập mật khẩu');
            return;
        }

        if (!createRole) {
            toast.warning('Vui lòng chọn vai trò');
            return;
        }

        try {
            setIsCreatingUser(true);

            await createUserByAdminAPI({
                username: createUsername.trim(),
                email: createEmail.trim(),
                password: createPassword,
                fullName: createFullName.trim() || undefined,
                phone: createPhone.trim() || undefined,
                address: createAddress.trim() || undefined,
                birthday: createBirthday || undefined,
                role: createRole,
            });

            toast.success('Tạo tài khoản thành công!');

            setIsCreateUserOpen(false);
            resetCreateUserForm();
            fetchCustomers(currentPage);
        } catch (error) {
            console.error('Create user error:', error);
            toast.error(
                error instanceof Error ? error.message : 'Tạo tài khoản thất bại'
            );
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchCustomers(0);
    };

    const getStatusClass = (isActive?: boolean) => {
        if (isActive === false) {
            return 'bg-red-100 text-red-700 border-red-200';
        }

        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };
    const handleResetFilter = () => {
        setFullName('');
        setUsername('');
        setEmail('');
        setPhone('');

        setTimeout(() => {
            fetchCustomers(0);
        }, 0);
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
            {/* Main Content */}
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
                                        <span className="text-primary font-bold">Khách hàng</span>
                                    </li>
                                </ol>
                            </nav>

                            <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 leading-none">
                                Quản lý nhân viên
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsCreateUserOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Thêm tài khoản
                        </button>
                    </section>

                    {/* Filter */}
                    <section className="mb-6 bg-white p-5 rounded-xl border border-outline-variant/10 shadow-sm">
                        <form
                            onSubmit={handleSearch}
                            className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
                        >
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                    Họ tên
                                </label>
                                <input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="VD: Huy Tạ"
                                    type="text"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                    Tên đăng nhập
                                </label>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="VD: anhuy"
                                    type="text"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                    Email
                                </label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="VD: user@gmail.com"
                                    type="text"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                    Số điện thoại
                                </label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="VD: 090..."
                                    type="text"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors"
                                >
                                    Tìm kiếm
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResetFilter}
                                    className="h-10 px-5 rounded-lg border border-outline-variant text-slate-600 text-sm font-bold bg-white transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Table */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-surface-container-low border-b border-outline-variant/10">
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Khách hàng
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Số điện thoại
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold text-right">
                                    Hành động
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-outline-variant/10">
                            {isLoadingCustomers ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            Đang tải khách hàng...
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-surface-container/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-center flex-shrink-0 font-bold">
                                                    {(customer.fullName ||
                                                        customer.username ||
                                                        'U')
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className="font-bold text-sm text-blue-900">
                                                        {customer.fullName || customer.username || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        ID: {customer.id} • @{customer.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {customer.email || '-'}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {customer.phone || '-'}
                                        </td>

                                        <td className="px-6 py-4">
                        <span
                            className={`inline-flex px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusClass(
                                customer.isActive
                            )}`}
                        >
                          {customer.isActive === false ? 'Inactive' : 'Active'}
                        </span>
                                        </td>

                                        <td className="px-6 py-4 text-right space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCustomer(customer)}
                                                className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
  <span className="material-symbols-outlined text-[18px]">
    visibility
  </span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                        Không có khách hàng nào
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        <div className="px-6 py-3 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/10">
                            <p className="text-xs text-slate-500">
                                {customers.length} / {pageData?.totalElements ?? customers.length}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage <= 0}
                                    onClick={() => fetchCustomers(currentPage - 1)}
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
                                    disabled={
                                        pageData ? currentPage + 1 >= pageData.totalPages : true
                                    }
                                    onClick={() => fetchCustomers(currentPage + 1)}
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

            {isCreateUserOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 px-4">
                    <div
                        className="rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col"
                        style={{
                            width: 'min(640px, calc(100vw - 32px))',
                            maxHeight: 'calc(100vh - 32px)',
                        }}
                    >
                        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-extrabold text-blue-900">
                                    Tạo tài khoản nội bộ
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreateUserOpen(false);
                                    resetCreateUserForm();
                                }}
                                disabled={isCreatingUser}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="flex flex-col min-h-0">
                            <div className="px-6 pb-6 space-y-4 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                            Tên đăng nhập <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={createUsername}
                                            onChange={(e) => setCreateUsername(e.target.value)}
                                            disabled={isCreatingUser}
                                            className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            placeholder="VD: staff01"
                                            type="text"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={createEmail}
                                            onChange={(e) => setCreateEmail(e.target.value)}
                                            disabled={isCreatingUser}
                                            className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            placeholder="VD: staff@gmail.com"
                                            type="email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                            Mật khẩu <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={createPassword}
                                            onChange={(e) => setCreatePassword(e.target.value)}
                                            disabled={isCreatingUser}
                                            className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            placeholder="Nhập mật khẩu"
                                            type="password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                            Vai trò <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={createRole}
                                            onChange={(e) => setCreateRole(e.target.value as Role)}
                                            disabled={isCreatingUser}
                                            className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="STAFF">STAFF</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                            Họ tên
                                        </label>
                                        <input
                                            value={createFullName}
                                            onChange={(e) => setCreateFullName(e.target.value)}
                                            disabled={isCreatingUser}
                                            className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            placeholder="VD: Nguyễn Văn A"
                                            type="text"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            value={createPhone}
                                            onChange={(e) => setCreatePhone(e.target.value)}
                                            disabled={isCreatingUser}
                                            className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            placeholder="VD: 0900000000"
                                            type="text"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                            Ngày sinh
                                        </label>
                                        <input
                                            value={createBirthday}
                                            onChange={(e) => setCreateBirthday(e.target.value)}
                                            disabled={isCreatingUser}
                                            className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            type="date"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                            Địa chỉ
                                        </label>
                                        <input
                                            value={createAddress}
                                            onChange={(e) => setCreateAddress(e.target.value)}
                                            disabled={isCreatingUser}
                                            className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            placeholder="Nhập địa chỉ"
                                            type="text"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateUserOpen(false);
                                        resetCreateUserForm();
                                    }}
                                    disabled={isCreatingUser}
                                    className="px-5 py-2 rounded-lg border border-outline-variant text-slate-600 text-sm font-bold bg-white disabled:opacity-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    disabled={isCreatingUser}
                                    className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50"
                                >
                                    {isCreatingUser ? 'Đang tạo...' : 'Tạo tài khoản'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedCustomer && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-outline-variant/10 overflow-hidden animate-fadeIn">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-blue-900">
                                    Chi tiết khách hàng
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Thông tin tài khoản và liên hệ của khách hàng.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedCustomer(null)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center text-2xl font-extrabold">
                                    {(selectedCustomer.fullName || selectedCustomer.username || 'U')
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">
                                        {selectedCustomer.fullName || selectedCustomer.username || 'Unknown'}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        @{selectedCustomer.username || '-'}
                                    </p>

                                    <span
                                        className={`inline-flex mt-2 px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-full ${
                                            selectedCustomer.isActive === false
                                                ? 'bg-red-100 text-red-700 border-red-200'
                                                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                        }`}
                                    >
              {selectedCustomer.isActive === false ? 'Inactive' : 'Active'}
            </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-surface-container-low rounded-xl p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                                        ID khách hàng
                                    </p>
                                    <p className="text-sm font-bold text-blue-900">
                                        #{selectedCustomer.id}
                                    </p>
                                </div>

                                <div className="bg-surface-container-low rounded-xl p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                                        Vai trò
                                    </p>
                                    <p className="text-sm font-bold text-blue-900">
                                        {selectedCustomer.role || '-'}
                                    </p>
                                </div>

                                <div className="bg-surface-container-low rounded-xl p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                                        Email
                                    </p>
                                    <p className="text-sm font-medium text-slate-700 break-all">
                                        {selectedCustomer.email || '-'}
                                    </p>
                                </div>

                                <div className="bg-surface-container-low rounded-xl p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                                        Số điện thoại
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {selectedCustomer.phone || '-'}
                                    </p>
                                </div>

                                <div className="bg-surface-container-low rounded-xl p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                                        Ngày sinh
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {selectedCustomer.birthday || '-'}
                                    </p>
                                </div>

                                <div className="bg-surface-container-low rounded-xl p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                                        Trạng thái
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {selectedCustomer.isActive === false
                                            ? 'Tài khoản bị vô hiệu hóa'
                                            : 'Tài khoản đang hoạt động'}
                                    </p>
                                </div>

                                <div className="md:col-span-2 bg-surface-container-low rounded-xl p-4">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                                        Địa chỉ
                                    </p>
                                    <p className="text-sm font-medium text-slate-700">
                                        {selectedCustomer.address || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low">
                            <button
                                type="button"
                                onClick={() => setSelectedCustomer(null)}
                                className="px-5 py-2 rounded-lg border border-outline-variant text-slate-600 text-sm font-bold hover:bg-white transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-around items-center py-3 border-t border-surface-container-highest z-50">
                <Link
                    href="/admin"
                    className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-slate-400"
                >
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Tổng quan</span>
                </Link>

                <Link
                    href="/admin/inventory"
                    className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-slate-400"
                >
                    <span className="material-symbols-outlined">keyboard</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Sản phẩm</span>
                </Link>

                <Link
                    href="/admin/orders"
                    className="flex flex-col items-center text-slate-400 py-2 px-4 rounded-lg"
                >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Đơn hàng</span>
                </Link>

                <Link
                    href="/admin/users"
                    className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-blue-900 font-bold"
                >
                    <span className="material-symbols-outlined">group</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Người dùng</span>
                </Link>
            </nav>
        </div>
    );
}
