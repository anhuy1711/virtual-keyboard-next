'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { createProductAPI, CreateProductRequest } from '@/app/services/productService';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<'dashboard' | 'create-product'>('dashboard');
  const [activeTab, setActiveTab] = useState<'info' | 'variants' | 'specs'>('info');
  const [selectedPeriod, setSelectedPeriod] = useState('D');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Product form state
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [colors, setColors] = useState(['Midnight Navy', 'Arctic White']);
  const [newColor, setNewColor] = useState('');
  const [specs, setSpecs] = useState([
    { name: 'Mounting Style', value: 'Gasket Mount' },
  ]);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      const userRole = decoded.role;

      console.log('Admin check - Decoded token:', { role: userRole, sub: decoded.sub });

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
  }, [router]);

  if (isLoading) {
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

  // Handlers for product form
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor)) {
      setColors([...colors, newColor]);
      setNewColor('');
    }
  };

  const addSpec = () => {
    if (newSpecName.trim() && newSpecValue.trim()) {
      setSpecs([...specs, { name: newSpecName, value: newSpecValue }]);
      setNewSpecName('');
      setNewSpecValue('');
    }
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Save product clicked!');

    // Validation
    if (!productName.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả sản phẩm');
      return;
    }

    if (!category) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }

    if (!coverImage) {
      toast.error('Vui lòng chọn ảnh bìa');
      return;
    }

    setIsSaving(true);

    try {
      // Mock variants data
      const mockVariants = [
        { id: 1, combination: 'Midnight Navy / ANSI', price: '349.00', quantity: '10' },
        { id: 2, combination: 'Arctic White / ANSI', price: '349.00', quantity: '5' },
      ];

      const request: CreateProductRequest = {
        name: productName,
        description: description,
        summary: productName,
        cover: coverImage,
        categoryId: parseInt(category),
        specifications: specs.map(spec => ({
          name: spec.name,
          value: spec.value,
        })),
        skus: mockVariants.map(variant => ({
          price: parseFloat(variant.price),
          quantity: parseInt(variant.quantity),
          sizeAttributeId: 1,
          colorAttributeId: 1,
          layoutAttributeId: 1,
        })),
      };

      console.log('📦 API Request:', request);
      const result = await createProductAPI(request);
      console.log('✅ Product created:', result);

      toast.success('✅ Tạo sản phẩm thành công!');

      // Reset form
      setProductName('');
      setCategory('');
      setDescription('');
      setCoverImage('');
      setSpecs([{ name: 'Mounting Style', value: 'Gasket Mount' }]);
      setCurrentView('dashboard');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      console.error('❌ Error:', errorMsg);
      toast.error('❌ ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardProduct = () => {
    if (window.confirm('Discard changes?')) {
      setCurrentView('dashboard');
      setProductName('');
      setCategory('');
      setDescription('');
      setCoverImage('');
      setActiveTab('info');
    }
  };

  const stats = [
    {
      icon: 'payments',
      label: 'Total Revenue',
      value: '$12,450',
      change: '+12.5%',
      positive: true,
    },
    {
      icon: 'inventory_2',
      label: 'Total Orders',
      value: '142',
      change: '+8.2%',
      positive: true,
    },
    {
      icon: 'person_add',
      label: 'Active Customers',
      value: '89',
      change: '+18.1%',
      positive: true,
    },
    {
      icon: 'trending_up',
      label: 'Store Traffic',
      value: '2.8k',
      change: '-2.4%',
      positive: false,
    },
  ];

  const chartData = [40, 55, 45, 65, 80, 70, 100, 85, 60, 40];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'];

  const orders = [
    {
      id: '#ORD-2841',
      customer: { name: 'Marcus Sterling', email: 'marcus.s@example.com', initials: 'MS' },
      date: 'Oct 24, 2023',
      total: '$245.00',
      status: 'Processing',
      statusColor: 'blue',
    },
    {
      id: '#ORD-2839',
      customer: { name: 'Elena Weaver', email: 'e.weaver@cloud.io', initials: 'EW' },
      date: 'Oct 23, 2023',
      total: '$182.50',
      status: 'Shipped',
      statusColor: 'indigo',
    },
    {
      id: '#ORD-2835',
      customer: { name: 'Julian Harts', email: 'j.harts@design.com', initials: 'JH' },
      date: 'Oct 22, 2023',
      total: '$1,120.00',
      status: 'Delivered',
      statusColor: 'emerald',
    },
  ];

  const maxValue = Math.max(...chartData);

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 flex flex-col py-8 bg-[#fcf9f8] border-r border-outline-variant/10 z-50">
        <div className="px-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white">keyboard</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-blue-900 leading-none">Admin Panel</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-label mt-1">
                Elite Keyboards
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-0">
          <a
            href="#"
            className="flex items-center gap-4 text-blue-900 font-bold border-l-4 border-blue-900 pl-4 py-3 bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-xs uppercase tracking-widest font-label">Dashboard</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 text-slate-500 pl-5 py-3 hover:bg-slate-200/50 transition-all"
          >
            <span className="material-symbols-outlined">keyboard</span>
            <span className="text-xs uppercase tracking-widest font-label">Inventory</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 text-slate-500 pl-5 py-3 hover:bg-slate-200/50 transition-all"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-xs uppercase tracking-widest font-label">Orders</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 text-slate-500 pl-5 py-3 hover:bg-slate-200/50 transition-all"
          >
            <span className="material-symbols-outlined">group</span>
            <span className="text-xs uppercase tracking-widest font-label">Customers</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 text-slate-500 pl-5 py-3 hover:bg-slate-200/50 transition-all"
          >
            <span className="material-symbols-outlined">monitoring</span>
            <span className="text-xs uppercase tracking-widest font-label">Analytics</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-4 text-slate-500 pl-5 py-3 hover:bg-slate-200/50 transition-all"
          >
            <span className="material-symbols-outlined">local_shipping</span>
            <span className="text-xs uppercase tracking-widest font-label">Logistics</span>
          </a>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto px-6 space-y-6">
          <button
            onClick={() => setCurrentView('create-product')}
            className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">New Product</span>
          </button>
          <div className="pt-6 border-t border-outline-variant/15 space-y-4">
            <a
              href="#"
              className="flex items-center gap-4 text-slate-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">help</span>
              <span className="text-xs uppercase tracking-widest font-label">Support</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-4 text-slate-500 hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-xs uppercase tracking-widest font-label">Logout</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-8 h-16 flex justify-between items-center w-full shadow-sm border-b border-outline-variant/10">
          <div className="flex items-center flex-1 max-w-xl gap-4">
            {currentView === 'create-product' && (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-2 hover:bg-surface-container-high rounded-lg transition-transform active:scale-95 text-slate-500"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            {currentView === 'create-product' ? (
              <h2 className="font-headline font-extrabold text-blue-900 text-lg tracking-tight">
                Add New Product
              </h2>
            ) : (
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-high rounded-lg border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-slate-500"
                  placeholder="Search analytics, products, users..."
                  type="text"
                />
              </div>
            )}
          </div>
          {currentView === 'create-product' ? (
            <div className="flex items-center gap-4">
              <button
                onClick={handleDiscardProduct}
                className="px-5 py-2 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high rounded-lg transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6 ml-8">
              <button className="relative text-slate-500 hover:text-blue-600 transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
              </button>
              <button className="text-slate-500 hover:text-blue-600 transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20 ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface leading-none">Admin profile</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Super Admin</p>
            </div>
            <img
              alt="Admin profile"
              className="w-10 h-10 rounded-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfx9K_nHMEV1FHHFphnk7YIRDiHB23D8e63oGnyRRr-4KhSu2PxRXpyRRjRp44FACGNAUg5UJY9TF8nLbzn_-wKn2tj3wfwNlwCt0aEVY5ziwvT4iJiIehMkkCOc3hUC1ieDkk8kfVwtRTflk6xh_BNLi8xpoBrfCUed5ROVjhQ_qxfRaQS1C5rajiDXxQQj1yJGcFLnuRaHeC8BpX1xY9CrkSivsLqoAV3VkSDbkTQXxI8vDDHdRm_tuf4GOGfp9IRJ3NhS3wDcE"
            />
          </div>
        </header>

        {/* Tabs Navigation - Only show for create-product view */}
        {currentView === 'create-product' && (
          <div className="bg-white border-b border-outline-variant/10 px-8 sticky top-16 z-30 shadow-sm">
            <div className="flex gap-10 max-w-4xl mx-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-5 text-xs font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === 'info'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-500 hover:text-primary border-b-2 border-transparent'
                }`}
              >
                Thông tin sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('variants')}
                className={`py-5 text-xs font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === 'variants'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-500 hover:text-primary border-b-2 border-transparent'
                }`}
              >
                Biến thể & SKU
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-5 text-xs font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === 'specs'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-500 hover:text-primary border-b-2 border-transparent'
                }`}
              >
                Thông số kỹ thuật
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {currentView === 'dashboard' ? (
          <div className="p-8 max-w-7xl mx-auto w-full space-y-10">
          {/* Welcome Header */}
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-label text-primary font-bold">
                Dashboard Overview
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 mt-2">
                The Digital Atelier
              </h1>
            </div>
            <div className="flex gap-4">
              <button className="px-5 py-2.5 rounded-lg bg-surface-container-high text-primary font-bold text-sm hover:bg-surface-container-highest transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                Last 30 Days
              </button>
              <button className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">download</span>
                Export Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-surface-container-lowest p-6 rounded-xl border-none shadow-sm flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 text-primary rounded-lg">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {stat.icon}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      stat.positive
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-rose-600 bg-rose-50'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-label">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-bold text-blue-900 mt-1">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Chart and Featured */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Sales Performance</h3>
                  <p className="text-sm text-slate-500">Revenue growth over the last 12 months</p>
                </div>
                <div className="flex gap-2">
                  {['D', 'W', 'M'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-all ${
                        selectedPeriod === period
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-high text-slate-500 hover:bg-surface-container'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="h-64 w-full flex items-end justify-between gap-1 px-4">
                {chartData.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-primary/20 rounded-t-full hover:bg-primary/40 transition-all relative group"
                    style={{ height: `${(value / maxValue) * 100}%` }}
                  >
                    {value === 100 && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded whitespace-nowrap font-bold">
                        $12.4k
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-around mt-4 px-4">
                {months.map((month, index) => (
                  <span
                    key={month}
                    className={`text-[10px] font-label font-bold ${
                      index === 6 ? 'text-primary underline underline-offset-4' : 'text-slate-400'
                    }`}
                  >
                    {month}
                  </span>
                ))}
              </div>
            </div>

            {/* Featured */}
            <div className="bg-primary p-8 rounded-xl shadow-lg flex flex-col justify-between text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Featured Collection</h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Your latest 'Ocean Blue' Keycap set has reached 500 orders this week. Manage
                  inventory levels now.
                </p>
                <button className="mt-6 bg-white text-primary px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-50 transition-all">
                  Restock Items
                </button>
              </div>
              <div className="mt-8 opacity-40 relative z-10">
                <img
                  alt="Mechanical Keyboard"
                  className="w-40 h-40 object-contain rotate-12 absolute -right-4 -bottom-12"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHybYDSDMx_P880ivGQal9sNn5cbIWgLpYjm9BlAXULPdRFbziTp3tZLj57mGMxHAhPo28Ws4yUeNFrQpVJ0gAaPy9cfRCUTk657Wllcgq6ecrOUtj-3IzDNuQyk2cyg2qaLIoWTDupNe1VhFXxwfAN9u5FRvTEMDhGlnrtevqe-8LZgGudMbhwG7FnsD5TxGjBLs0bypekVXBjxgsJXdw77xOKQKsAUVkFda9ARLtmyrnpNBxH1O9WsoJnBfr2OYAzAHahWfb-wo"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-800 pointer-events-none"></div>
            </div>
          </div>

          {/* Orders Table */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-blue-900 tracking-tight">Recent Orders</h2>
              <a className="text-sm font-bold text-secondary hover:underline underline-offset-4 flex items-center gap-1">
                View All Orders
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/15">
                    <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-label font-extrabold text-slate-500">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-label font-extrabold text-slate-500">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-label font-extrabold text-slate-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-label font-extrabold text-slate-500">
                      Total
                    </th>
                    <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-label font-extrabold text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[11px] uppercase tracking-widest font-label font-extrabold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-5 font-mono text-xs text-blue-900 font-semibold">
                        {order.id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-primary">
                            {order.customer.initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{order.customer.name}</p>
                            <p className="text-[10px] text-slate-500">{order.customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">{order.date}</td>
                      <td className="px-6 py-5 text-sm font-bold text-blue-900">{order.total}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            order.statusColor === 'blue'
                              ? 'bg-blue-50 text-blue-700'
                              : order.statusColor === 'indigo'
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        ) : (
          /* Create Product Form */
          <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-10">
            <form onSubmit={handleSaveProduct} className="space-y-10">
              {/* Tab 1: Product Info */}
              {activeTab === 'info' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-primary rounded-xl">
                      <span className="material-symbols-outlined">inventory_2</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Atelier Core</span>
                      <h3 className="text-2xl font-extrabold text-blue-900 tracking-tight">Thông tin sản phẩm</h3>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-on-surface-variant ml-1">Product Name</label>
                        <input
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-white border border-outline-variant hover:border-outline focus:border-primary focus:ring-1 focus:ring-primary text-sm placeholder:text-slate-400 transition-all font-medium"
                          placeholder="e.g. Atelier Pro-65 Mechanical Keyboard"
                          type="text"
                        />
                      </div>
                      <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-on-surface-variant ml-1">Category</label>
                        <div className="relative">
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none px-4 py-3 rounded-lg bg-white border border-outline-variant hover:border-outline focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition-all cursor-pointer"
                          >
                            <option value="">Select Category</option>
                            <option value="1">Custom Keyboards</option>
                            <option value="2">Switches</option>
                            <option value="3">Keycaps</option>
                            <option value="4">Accessories</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg">
                            expand_more
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2.5 mt-8">
                      <label className="block text-xs font-semibold text-on-surface-variant ml-1">Description</label>
                      <div className="bg-white rounded-lg overflow-hidden border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 outline-none text-sm font-medium resize-none leading-relaxed"
                          placeholder="Describe the craftsmanship and technical details..."
                          rows={6}
                        ></textarea>
                      </div>
                    </div>
                    <div className="space-y-2.5 mt-8">
                      <label className="block text-xs font-semibold text-on-surface-variant ml-1">Cover Image</label>
                      <label className="border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center p-12 bg-white group hover:border-primary hover:bg-blue-50/10 transition-all cursor-pointer">
                        <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                          <span className="material-symbols-outlined text-2xl text-primary">add_a_photo</span>
                        </div>
                        <p className="text-sm font-bold text-on-surface mb-1">Click to upload cover image</p>
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Recommended: 1200x800px</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Variants */}
              {activeTab === 'variants' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-primary rounded-xl">
                      <span className="material-symbols-outlined">style</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Product Options</span>
                      <h3 className="text-2xl font-extrabold text-blue-900 tracking-tight">Biến thể & SKU</h3>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden">
                    <div className="p-8 border-b border-outline-variant/10 bg-surface-container-low/30 space-y-6">
                      <p className="text-xs uppercase tracking-widest font-extrabold text-blue-900 mb-6">Configure Attributes</p>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold text-on-surface-variant block ml-1">Color</label>
                        <div className="flex flex-wrap gap-3">
                          {colors.map((color) => (
                            <span
                              key={color}
                              className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-primary bg-blue-50/30 text-primary text-xs font-bold"
                            >
                              {color}
                            </span>
                          ))}
                          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-outline-variant/20">
                            <input
                              type="text"
                              value={newColor}
                              onChange={(e) => setNewColor(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addColor();
                                }
                              }}
                              className="px-4 py-2 h-10 text-xs font-bold border border-outline-variant bg-white rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none w-36"
                              placeholder="New color..."
                            />
                            <button
                              onClick={addColor}
                              type="button"
                              className="flex items-center justify-center h-10 w-10 bg-primary text-white rounded-lg hover:opacity-90 shadow-sm transition-all"
                            >
                              <span className="material-symbols-outlined text-lg">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-surface-container-low border-b border-outline-variant/15">
                          <tr>
                            <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-slate-500">Combination</th>
                            <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-slate-500">Price (USD)</th>
                            <th className="px-8 py-5 text-[10px] uppercase tracking-widest font-bold text-slate-500">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          <tr className="hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-8 py-6 text-sm font-bold text-blue-900">Midnight Navy / ANSI</td>
                            <td className="px-8 py-6"><input className="w-32 py-2 px-4 text-sm font-mono font-bold bg-white border border-outline-variant rounded-lg" type="number" value="349.00" readOnly /></td>
                            <td className="px-8 py-6"><input className="w-24 py-2 px-4 text-sm font-mono font-bold bg-white border border-outline-variant rounded-lg" type="number" value="10" readOnly /></td>
                          </tr>
                          <tr className="hover:bg-surface-container-low/30 transition-colors">
                            <td className="px-8 py-6 text-sm font-bold text-blue-900">Arctic White / ANSI</td>
                            <td className="px-8 py-6"><input className="w-32 py-2 px-4 text-sm font-mono font-bold bg-white border border-outline-variant rounded-lg" type="number" value="349.00" readOnly /></td>
                            <td className="px-8 py-6"><input className="w-24 py-2 px-4 text-sm font-mono font-bold bg-white border border-outline-variant rounded-lg" type="number" value="5" readOnly /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Specs */}
              {activeTab === 'specs' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-primary rounded-xl">
                        <span className="material-symbols-outlined">settings_suggest</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Technical Details</span>
                        <h3 className="text-2xl font-extrabold text-blue-900 tracking-tight">Thông số kỹ thuật</h3>
                      </div>
                    </div>
                    <button
                      onClick={addSpec}
                      type="button"
                      disabled={!newSpecName.trim() || !newSpecValue.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-primary font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-surface-container-highest transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                      Add Field
                    </button>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 space-y-6">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex gap-6 items-end">
                        <div className="flex-1 space-y-2">
                          <label className="block text-xs font-semibold text-on-surface-variant ml-1">Field Name</label>
                          <input className="w-full px-5 py-3 rounded-lg bg-white border border-outline-variant text-sm font-medium transition-all" type="text" value={spec.name} readOnly />
                        </div>
                        <div className="flex-[1.5] space-y-2">
                          <label className="block text-xs font-semibold text-on-surface-variant ml-1">Value</label>
                          <input className="w-full px-5 py-3 rounded-lg bg-white border border-outline-variant text-sm font-medium transition-all" type="text" value={spec.value} readOnly />
                        </div>
                        <button
                          onClick={() => removeSpec(index)}
                          type="button"
                          className="mb-1 p-2.5 text-slate-300 hover:text-error hover:bg-error-container/10 rounded-lg transition-all"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-6 items-end pt-4 border-t border-outline-variant/10">
                      <div className="flex-1 space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant ml-1">Field Name</label>
                        <input
                          value={newSpecName}
                          onChange={(e) => setNewSpecName(e.target.value)}
                          className="w-full px-5 py-3 rounded-lg bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition-all"
                          placeholder="e.g. PCB Type"
                          type="text"
                        />
                      </div>
                      <div className="flex-[1.5] space-y-2">
                        <label className="block text-xs font-semibold text-on-surface-variant ml-1">Value</label>
                        <input
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          className="w-full px-5 py-3 rounded-lg bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium transition-all"
                          placeholder="e.g. Hotswap 1.2mm"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-10 pb-16 flex justify-center">
                <button
                  type="submit"
                  className="w-full max-w-lg py-5 bg-primary text-white font-headline font-black text-lg uppercase tracking-widest rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-4"
                >
                  <span className="material-symbols-outlined text-2xl">save</span>
                  Save Product & Variants
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto p-8 border-t border-outline-variant/10 flex justify-between items-center text-slate-400 bg-white">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary mb-1">
                {currentView === 'create-product' ? 'Editor Status' : 'Last Update'}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {currentView === 'create-product' ? 'Ready to Publish' : 'October 25, 2023 at 10:45 AM'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-primary mb-1">
                {currentView === 'create-product' ? 'Last Saved' : 'System Status'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-xs text-slate-600 font-medium">
                  {currentView === 'create-product' ? 'Auto-save active' : 'All Operations Active'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-bold tracking-widest font-label uppercase">
            © 2023 The Digital Atelier. Crafted for Tactile Precision.
          </div>
        </footer>
      </main>
    </div>
  );
}

