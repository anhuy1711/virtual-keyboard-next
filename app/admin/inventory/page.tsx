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


      {/* Main Content */}
      <main className="md:ml-64 w-full overflow-auto pb-20 md:pb-0">
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






