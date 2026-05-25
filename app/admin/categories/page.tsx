'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { logoutAPI } from '@/app/services/authService';
import { toast } from 'react-toastify';
import {
    CategoryResponse,
    createCategoryAPI,
    deleteCategoryAPI,
    getCategoriesAPI,
    SimplePage,
    updateCategoryAPI
} from '@/app/services/categoryService';

interface Category {
    id: number;
    name: string;
    description?: string | null;
}


export default function CategoriesPage() {
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 20;
    const router = useRouter();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDescription, setNewCategoryDescription] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryResponse | null>(null);
    const [isDeletingCategory, setIsDeletingCategory] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<CategoryResponse | null>(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editCategoryDescription, setEditCategoryDescription] = useState('');
    const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

    const openEditCategoryModal = (category: CategoryResponse) => {
        setCategoryToEdit(category);
        setEditCategoryName(category.name || '');
        setEditCategoryDescription(category.description || '');
    };
    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryToEdit) return;

        if (!editCategoryName.trim()) {
            toast.warning('Vui lòng nhập tên danh mục');
            return;
        }

        try {
            setIsUpdatingCategory(true);

            await updateCategoryAPI(categoryToEdit.id, {
                name: editCategoryName.trim(),
                description: editCategoryDescription.trim() || undefined,
            });

            toast.success('Cập nhật danh mục thành công!');

            setCategoryToEdit(null);
            setEditCategoryName('');
            setEditCategoryDescription('');

            fetchCategories(currentPage);
        } catch (error) {
            console.error('Update category error:', error);
            toast.error(
                error instanceof Error ? error.message : 'Cập nhật danh mục thất bại'
            );
        } finally {
            setIsUpdatingCategory(false);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCategoryName.trim()) {
            toast.warning('Vui lòng nhập tên danh mục');
            return;
        }

        try {
            setIsCreatingCategory(true);

            await createCategoryAPI({
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim() || undefined,
            });

            toast.success('Tạo danh mục thành công!');

            setIsCreateModalOpen(false);
            setNewCategoryName('');
            setNewCategoryDescription('');

            fetchCategories(currentPage);
        } catch (error) {
            console.error('Create category error:', error);
            toast.error('Tạo danh mục thất bại');
        } finally {
            setIsCreatingCategory(false);
        }
    };

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
            fetchCategories(0);
        }
    }, [isAuthorized]);

    const fetchCategories = async (page: number = 0, keyword: string = searchName) => {
        try {
            setIsLoadingCategories(true);

            const response = await getCategoriesAPI(keyword, page, pageSize);

            setCategories(response.content || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Lỗi khi tải danh sách danh mục');
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchCategories(0);
    };

    const openDeleteCategoryModal = (category: CategoryResponse) => {
        setCategoryToDelete(category);
    };

    const handleConfirmDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            setIsDeletingCategory(true);

            await deleteCategoryAPI(categoryToDelete.id);

            toast.success('Xóa danh mục thành công!');

            setCategoryToDelete(null);
            fetchCategories(currentPage);
        } catch (error) {
            console.error('Delete category error:', error);
            toast.error(
                error instanceof Error ? error.message : 'Xóa danh mục thất bại'
            );
        } finally {
            setIsDeletingCategory(false);
        }
    };

    const handleLogout = () => {
        logoutAPI();
        toast.success('Đã đăng xuất!');
        router.push('/');
    };

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



    return (

        <div className="flex h-screen bg-surface-ivory">
            {/* Main Content */}
            <main className="w-full pb-20 md:pb-0">
                {/* Top Header */}


                {/* Category Content */}
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
                                        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                                    </li>
                                    <li>
                                        <span className="text-primary font-bold">Danh mục</span>
                                    </li>
                                </ol>
                            </nav>

                            <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 leading-none">
                                Quản lý danh mục
                            </h1>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-hover transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Thêm danh mục
                            </button>
                        </div>
                    </section>

                    {/* Search Bar */}
                    <section className="mb-8 bg-white p-6 rounded-lg border border-outline-variant/10 shadow-sm space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-4 flex-wrap items-end">
                            <div className="flex-1 min-w-48">
                                <label className="block text-label-md font-label-md text-text-secondary mb-2">
                                    Tìm kiếm danh mục
                                </label>

                                <input
                                    type="text"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    placeholder="Nhập tên danh mục..."
                                    className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isLoadingCategories}
                                    className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">search</span>
                                    Tìm kiếm
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchName('');
                                        setCurrentPage(0);
                                        fetchCategories(0, '');
                                    }}
                                    className="px-6 py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container transition-colors"
                                >
                                    Xóa bộ lọc
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
                                    Tên danh mục
                                </th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                    Mô tả
                                </th>
                                <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold text-right">
                                    Hành động
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-outline-variant/10">
                            {isLoadingCategories ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                            Đang tải danh mục...
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length > 0 ? (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-surface-container/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary text-3xl">category</span>
                                                </div>

                                                <div>
                                                    <p className="font-bold text-blue-900">{category.name}</p>
                                                    <p className="text-xs text-slate-400">ID: {category.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-8 py-6">
                                            <p className="text-sm text-slate-500 line-clamp-1 max-w-md">
                                                {category.description || 'Không có mô tả'}
                                            </p>
                                        </td>

                                        <td className="px-8 py-6 text-right space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditCategoryModal(category)}
                                                className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
  <span className="material-symbols-outlined text-[18px]">
    edit
  </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openDeleteCategoryModal(category)}
                                                className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
  <span className="material-symbols-outlined text-[18px]">
    delete
  </span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-8 py-12 text-center text-slate-500">
                                        Không có danh mục nào
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-8 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/10">
                            <p className="text-xs text-slate-500">
                                {categories.length} / {totalElements}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={currentPage <= 0 || isLoadingCategories}
                                    onClick={() => fetchCategories(currentPage - 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 hover:bg-surface-container-lowest transition-colors disabled:opacity-40"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>

                                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">
                                    {currentPage + 1}
                                </button>

                                <button
                                    type="button"
                                    disabled={currentPage + 1 >= totalPages || isLoadingCategories}
                                    onClick={() => fetchCategories(currentPage + 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 hover:bg-surface-container-lowest transition-colors disabled:opacity-40"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {categoryToEdit && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 px-4">
                    <div
                        className="rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col"
                        style={{
                            width: 'min(520px, calc(100vw - 32px))',
                            maxHeight: 'calc(100vh - 32px)',
                        }}
                    >
                        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-extrabold text-blue-900">
                                    Sửa danh mục
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Cập nhật thông tin danh mục sản phẩm.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCategoryToEdit(null)}
                                disabled={isUpdatingCategory}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCategory} className="flex flex-col min-h-0">
                            <div className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                        Tên danh mục <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                        disabled={isUpdatingCategory}
                                        className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder="VD: Keyboard"
                                        type="text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                        Mô tả
                                    </label>

                                    <textarea
                                        value={editCategoryDescription}
                                        onChange={(e) => setEditCategoryDescription(e.target.value)}
                                        disabled={isUpdatingCategory}
                                        className="w-full min-h-28 px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                        placeholder="Mô tả ngắn về danh mục..."
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setCategoryToEdit(null)}
                                    disabled={isUpdatingCategory}
                                    className="px-5 py-2 rounded-lg border border-outline-variant text-slate-600 text-sm font-bold bg-white disabled:opacity-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    disabled={isUpdatingCategory}
                                    className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50"
                                >
                                    {isUpdatingCategory ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-outline-variant/10 overflow-hidden animate-fadeIn">
                        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-blue-900">
                                    Tạo danh mục mới
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                disabled={isCreatingCategory}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory}>
                            <div className="px-6 pb-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                        Tên danh mục <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        disabled={isCreatingCategory}
                                        className="w-full h-11 px-4 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        placeholder="VD: Switch"
                                        type="text"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                        Mô tả
                                    </label>

                                    <textarea
                                        value={newCategoryDescription}
                                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                                        disabled={isCreatingCategory}
                                        className="w-full min-h-28 px-4 py-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                        placeholder="Mô tả ..."
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    disabled={isCreatingCategory}
                                    className="px-5 py-2 rounded-lg border border-outline-variant text-slate-600 text-sm font-bold hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    disabled={isCreatingCategory}
                                    className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50"
                                >
                                    {isCreatingCategory ? 'Đang tạo...' : 'Tạo danh mục'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {categoryToDelete && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 px-4">
                    <div
                        className="rounded-2xl bg-white px-6 py-6 text-center shadow-xl"
                        style={{
                            width: "min(320px, calc(100vw - 32px))",
                        }}
                    >
                        {/* Icon đỏ */}
                        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
        <span className="material-symbols-outlined text-[22px] text-red-500">
          delete
        </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-base font-bold text-slate-900">
                            Xác nhận xoá
                        </h2>

                        {/* Tên danh mục */}
                        <p className="mt-3 text-sm font-semibold text-blue-900 break-words">
                            {categoryToDelete.name}
                        </p>

                        {/* Buttons */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setCategoryToDelete(null)}
                                disabled={isDeletingCategory}
                                className="h-10 rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 disabled:opacity-50"
                            >
                                Huỷ
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmDeleteCategory}
                                disabled={isDeletingCategory}
                                style={{
                                    backgroundColor: '#ef4444',
                                    color: '#ffffff',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f87171';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ef4444';
                                }}
                                className="h-10 rounded-lg text-sm font-bold disabled:opacity-50"
                            >
                                {isDeletingCategory ? 'Đang xoá...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-around items-center py-3 border-t border-surface-container-highest z-50">
                <Link href="/admin" className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-slate-400">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Tổng quan</span>
                </Link>

                <Link href="/admin/inventory" className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-slate-400">
                    <span className="material-symbols-outlined">keyboard</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Sản phẩm</span>
                </Link>

                <Link href="/admin/categories" className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-blue-900 font-bold">
                    <span className="material-symbols-outlined">category</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Danh mục</span>
                </Link>

                <Link href="#" className="flex flex-col items-center text-slate-400 py-2 px-4 rounded-lg">
                    <span className="material-symbols-outlined">shopping_cart</span>
                    <span className="text-[10px] uppercase font-label-sm mt-1">Đơn hàng</span>
                </Link>
            </nav>
        </div>

    );
}
