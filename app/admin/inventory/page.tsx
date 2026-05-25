'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import {
  filterProductsAPI,
  ProductSearchRequest,
  getCategoriesAPI,
  CategoryResponse,
} from '@/app/services/productService';import { logoutAPI } from '@/app/services/authService';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  name: string;
  description: string;
  cover: string;
  categoryId: number;
  categoryName: string;
  skus?: Array<{ id?: number; quantity?: number; price?: number; [key: string]: number | string | undefined }>;
}

export default function InventoryPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(0);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    if (isAuthorized) {
      fetchProducts(0);
      fetchCategories();
    }
  }, [isAuthorized]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);

      const response = await getCategoriesAPI(0, 100);

      setCategories(response.content || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setIsLoadingCategories(false);
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
      fetchProducts(0);
    }
  }, [isAuthorized]);

  const fetchProducts = async (
      page: number = 0,
      filters?: {
        name?: string;
        categoryId?: number;
      }
  ) => {
    try {
      setIsLoadingProducts(true);

      const searchRequest: ProductSearchRequest = {
        name: filters?.name ?? (searchName || undefined),
        categoryId: filters?.categoryId ?? selectedCategory,
      };

      const response = await filterProductsAPI(searchRequest, page, 20);

      setProducts((response.content || []) as Product[]);
      setPageData(response);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    fetchProducts(0, {
      name: searchName.trim() || undefined,
      categoryId: selectedCategory || undefined,
    });
  };

  const handleResetFilter = () => {
    setSearchName('');
    setSelectedCategory(undefined);

    fetchProducts(0, {
      name: undefined,
      categoryId: undefined,
    });
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
    fetchProducts(0);
  };

  const handleLogout = () => {
    logoutAPI();
    toast.success('Đã đăng xuất!');
    router.push('/');
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      setIsDeletingProduct(true);

      const token = localStorage.getItem('accessToken');

      const res = await fetch(
          `http://localhost:8080/products/delete?id=${productToDelete.id}`,
          {
            method: 'DELETE',
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();

      if (json.code !== 200) {
        throw new Error(json.message || `API error: ${json.code}`);
      }

      toast.success('Xóa sản phẩm thành công!');

      setProductToDelete(null);
      fetchProducts(currentPage);
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Xóa sản phẩm thất bại');
    } finally {
      setIsDeletingProduct(false);
    }
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
      {/* Sidebar */}


      {/* Main Content */}
      <main className="w-full pb-20 md:pb-0">
        {/* Top Header */}

        {/* Inventory Content */}
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
                    <span className="text-primary font-bold">Kho</span>
                  </li>
                </ol>
              </nav>
              <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 leading-none">Quản lý sản phẩm</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/create" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:shadow-lg transition-all active:scale-95">
                <span className="material-symbols-outlined text-sm">add</span>
                Thêm sản phẩm
              </Link>
            </div>
          </section>

          {/* Filter */}
          <section className="mb-6 bg-white p-5 rounded-xl border border-outline-variant/10 shadow-sm">
            <form
                onSubmit={handleSearch}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                  Tên sản phẩm
                </label>

                <input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="VD: Neo98, switch, keycap..."
                    type="text"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                  Danh mục
                </label>

                <select
                    value={selectedCategory ?? ''}
                    onChange={(e) =>
                        setSelectedCategory(
                            e.target.value ? Number(e.target.value) : undefined
                        )
                    }
                    disabled={isLoadingCategories}
                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingCategories ? 'Đang tải...' : 'Tất cả danh mục'}
                  </option>

                  {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                  ))}
                </select>
              </div>

              <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-bold transition-colors"
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
            </form>
          </section>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
            <table className="w-full text-left border-collapse">
              <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                  Tên
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                  Danh mục
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold text-right">
                  Số lượng
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold text-right">
                  Hành động
                </th>
              </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/10">
              {isLoadingProducts ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Đang tải sản phẩm...
                      </div>
                    </td>
                  </tr>
              ) : products.length > 0 ? (
                  products.map((product) => (
                      <tr
                          key={product.id}
                          className="hover:bg-surface-container/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  src={product.cover}
                              />
                            </div>

                            <div>
                              <p className="font-bold text-sm text-blue-900">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-400">ID: {product.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
              <span className=" px-2.5 py-1 text-sm text-blue-900 font-bold tracking-wider rounded-full">
                {product.categoryName}
              </span>
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-bold text-blue-900">
                          {product.skus?.length || 0} SKUs
                        </td>

                        <td className="px-6 py-4 text-right space-x-1">
                          <Link
                              href={`/admin/products/${product.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
                          </Link>

                          <button
                              type="button"
                              onClick={() => setProductToDelete(product)}
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
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      Không có sản phẩm nào
                    </td>
                  </tr>
              )}
              </tbody>
            </table>

            <div className="px-6 py-3 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/10">
              <p className="text-xs text-slate-500">
                {products.length} / {pageData?.totalElements ?? products.length}
              </p>

              <div className="flex gap-2">
                <button
                    disabled={currentPage <= 0}
                    onClick={() => fetchProducts(currentPage - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 hover:bg-surface-container-lowest transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>

                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">
                  1
                </button>

                <button
                    disabled={pageData ? currentPage + 1 >= pageData.totalPages : true}
                    onClick={() => fetchProducts(currentPage + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 hover:bg-surface-container-lowest transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {productToDelete && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 px-4">
            <div
                className="rounded-2xl bg-white px-6 py-6 text-center shadow-xl"
                style={{
                  width: 'min(320px, calc(100vw - 32px))',
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

              {/* Tên sản phẩm */}
              <p className="mt-3 text-sm font-semibold text-blue-900 break-words">
                {productToDelete.name}
              </p>

              {/* Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setProductToDelete(null)}
                    disabled={isDeletingProduct}
                    className="h-10 rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 disabled:opacity-50"
                >
                  Huỷ
                </button>

                <button
                    type="button"
                    onClick={handleConfirmDeleteProduct}
                    disabled={isDeletingProduct}
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
                  {isDeletingProduct ? 'Đang xoá...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Mobile Navigation */}

    </div>
  );
}






