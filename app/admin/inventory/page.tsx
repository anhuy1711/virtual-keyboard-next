'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { filterProductsAPI, ProductSearchRequest } from '@/app/services/productService';
import { logoutAPI } from '@/app/services/authService';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  name: string;
  description: string;
  cover: string;
  categoryId: number;
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

  const fetchProducts = async (page: number = 0) => {
    try {
      setIsLoadingProducts(true);
      const searchRequest: ProductSearchRequest = {
        name: searchName || undefined,
        categoryId: selectedCategory || undefined,
      };
      
      const response = await filterProductsAPI(searchRequest, page, 20);
      setProducts((response.content || []) as Product[]);
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
    setCurrentPage(0);
    fetchProducts(0);
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
      <aside className="fixed left-0 top-0 h-full flex flex-col py-8 bg-surface-bright dark:bg-dark-surface w-64 hidden md:flex z-50 border-r border-outline-variant/10">
        <div className="px-8 mb-10">
          <h1 className="text-lg font-black text-blue-900 dark:text-blue-50 uppercase tracking-tight">Admin Panel</h1>
          <p className="font-label-sm text-label-sm text-slate-500">Elite Keyboards</p>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all rounded-lg">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md uppercase tracking-widest">Dashboard</span>
          </Link>

          <Link href="/admin/inventory" className="flex items-center space-x-4 py-3 text-blue-900 dark:text-blue-400 font-bold border-l-4 border-blue-900 dark:border-blue-400 pl-4 bg-surface-container-low">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              keyboard
            </span>
            <span className="font-label-md text-label-md uppercase tracking-widest">Kho</span>
          </Link>

          <Link href="/admin/categories" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all rounded-lg">
            <span className="material-symbols-outlined">category</span>
            <span className="font-label-md text-label-md uppercase tracking-widest">Danh mục</span>
          </Link>

          <Link href="#" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all rounded-lg">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md text-label-md uppercase tracking-widest">Orders</span>
          </Link>

          <Link href="#" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all rounded-lg">
            <span className="material-symbols-outlined">group</span>
            <span className="font-label-md text-label-md uppercase tracking-widest">Customers</span>
          </Link>

          <Link href="#" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all rounded-lg">
            <span className="material-symbols-outlined">monitoring</span>
            <span className="font-label-md text-label-md uppercase tracking-widest">Analytics</span>
          </Link>

          <Link href="#" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all rounded-lg">
            <span className="material-symbols-outlined">local_shipping</span>
            <span className="font-label-md text-label-md uppercase tracking-widest">Logistics</span>
          </Link>
        </nav>

        <div className="px-8 mt-auto space-y-4">
          <button className="w-full bg-primary text-white py-3 rounded-lg font-label-md uppercase tracking-widest hover:bg-primary-hover transition-colors active:scale-95">
            New Product
          </button>

          <div className="flex flex-col space-y-2 pt-4 border-t border-outline-variant">
            <a href="#" className="flex items-center space-x-3 text-slate-500 hover:text-blue-900 transition-colors">
              <span className="material-symbols-outlined">help</span>
              <span className="font-label-sm text-label-sm">Support</span>
            </a>
            <button onClick={handleLogout} className="flex items-center space-x-3 text-slate-500 hover:text-error transition-colors">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-label-sm text-label-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 w-full overflow-auto pb-20 md:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center w-full px-6 py-3 h-16 shadow-sm border-b border-outline-variant/10">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight text-blue-900 dark:text-blue-50 font-h2">The Digital Atelier</span>
            <div className="hidden md:flex bg-surface-container-low px-4 py-1.5 rounded-full items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface outline-none" placeholder="Quick find..." type="text" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link className="hidden sm:flex items-center gap-2 text-blue-900 hover:text-blue-600 transition-colors font-label-md text-label-md" href="/">
              <span className="material-symbols-outlined">open_in_new</span>
              View Shop
            </Link>
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-blue-600 transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="text-slate-500 hover:text-blue-600 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-container">
                <img alt="Admin Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0naN37gHNiyU1lRByFMPBCjd7md3vCQFIl5TTZX-6AltWS0S-freIeKWLWMliYGwb4Bh_ENnT0zJu9oEVrxLjAlA8THDpExu7aKmOs9DX93qJtqZD7tyYn_D6DKI_nanopjxJIX49mCBkb7IljhqwxEO0VRHxR0X6mKh0eLFyXgP0o-et6-2N1dZ8c706xybCGTUMV_fUnfci5KjVhn8xSunUYFFcpNvFSDoWO__Oq08cM18i4EGKQ_xddkpZux8N_PxzwGR5s3g" />
              </div>
            </div>
          </div>
        </header>

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
              <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 leading-none">Product Management</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/create" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-container rounded-lg hover:shadow-lg transition-all active:scale-95">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Product
              </Link>
              {/*<button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-900 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors">*/}
              {/*  <span className="material-symbols-outlined text-sm">filter_list</span>*/}
              {/*  Filter*/}
              {/*</button>*/}
              {/*<button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-900 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors">*/}
              {/*  <span className="material-symbols-outlined text-sm">download</span>*/}
              {/*  Export CSV*/}
              {/*</button>*/}
            </div>
          </section>

          {/* Search & Filter Bar */}
          <section className="mb-8 bg-white p-6 rounded-lg border border-outline-variant/10 shadow-sm space-y-4">
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap items-end">
              <div className="flex-1 min-w-48">
                <label className="block text-label-md font-label-md text-text-secondary mb-2">
                  Tìm kiếm sản phẩm
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md"
                />
              </div>

              <div className="flex-1 min-w-48">
                <label className="block text-label-md font-label-md text-text-secondary mb-2">
                  Danh mục
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => handleCategoryFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md bg-white"
                >
                  <option value="">Tất cả danh mục</option>
                  <option value="1">Keyboards</option>
                  <option value="2">Switches</option>
                  <option value="3">Keycaps</option>
                  <option value="4">Accessories</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoadingProducts}
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">search</span>
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchName('');
                    setSelectedCategory(undefined);
                    setCurrentPage(0);
                  }}
                  className="px-6 py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </form>
          </section>

          {/* Stats Cards */}
          {/*<section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">*/}
          {/*  <div className="p-6 bg-white rounded-xl shadow-sm space-y-2 border-l-4 border-primary">*/}
          {/*    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-label">Total Products</p>*/}
          {/*    <p className="text-2xl font-black text-blue-900">{products.length}</p>*/}
          {/*  </div>*/}
          {/*  <div className="p-6 bg-white rounded-xl shadow-sm space-y-2 border-l-4 border-secondary">*/}
          {/*    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-label">Active Orders</p>*/}
          {/*    <p className="text-2xl font-black text-blue-900">42</p>*/}
          {/*  </div>*/}
          {/*  <div className="p-6 bg-white rounded-xl shadow-sm space-y-2 border-l-4 border-error">*/}
          {/*    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-label">Low Stock Alerts</p>*/}
          {/*    <p className="text-2xl font-black text-blue-900">8</p>*/}
          {/*  </div>*/}
          {/*  <div className="p-6 bg-white rounded-xl shadow-sm space-y-2 border-l-4 border-tertiary-container">*/}
          {/*    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-label">Total Inventory Value</p>*/}
          {/*    <p className="text-2xl font-black text-blue-900">$182.4k</p>*/}
          {/*  </div>*/}
          {/*</section>*/}

          {/* Table */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">Tên</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">Danh mục</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold text-right">Số lượng</th>
                  <th className="px-8 py-5 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {isLoadingProducts ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Đang tải sản phẩm...
                      </div>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-container/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0">
                            <img alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.cover} />
                          </div>
                          <div>
                            <p className="font-bold text-blue-900">{product.name}</p>
                            <p className="text-xs text-slate-400">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wider rounded-full">
                          Cat {product.categoryId}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-blue-900">{product.skus?.length || 0} SKUs</td>

                      <td className="px-8 py-6 text-right space-x-2">
                        <Link href={`/admin/products/${product.id}`} className="inline-block p-2 text-slate-400 hover:text-blue-900 transition-colors">
                          <span className="material-symbols-outlined">edit</span>
                        </Link>
                        <button
                            onClick={async () => {
                              if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) return;

                              try {
                                const token = localStorage.getItem("accessToken");

                                const res = await fetch(
                                    `http://localhost:8080/products/delete?id=${product.id}`,
                                    {
                                      method: "DELETE",
                                      headers: {
                                        ...(token && { Authorization: `Bearer ${token}` }),
                                      },
                                    }
                                );

                                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                                const json = await res.json();
                                if (json.code !== 200) throw new Error(`API error: ${json.code}`);

                                toast.success("Xóa sản phẩm thành công!");
                                fetchProducts(currentPage); // Refresh lại danh sách
                              } catch (err) {
                                console.error("Error deleting product:", err);
                                toast.error("Xóa sản phẩm thất bại");
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                      Không có sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-8 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/10">
              <p className="text-xs text-slate-500">{products.length} / {products.length}</p>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 hover:bg-surface-container-lowest transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 hover:bg-surface-container-lowest transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex justify-around items-center py-3 border-t border-surface-container-highest z-50">
        <Link href="/admin" className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-slate-400">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] uppercase font-label-sm mt-1">Dash</span>
        </Link>
        <Link href="/admin/inventory" className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-blue-900 font-bold">
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






