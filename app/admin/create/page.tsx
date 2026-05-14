'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { createProductAPI, CreateProductRequest } from '@/app/services/productService';
import { logoutAPI } from '@/app/services/authService';
import { toast } from 'react-toastify';

interface OptionValue {
  name: string;
}

interface Option {
  name: string;
  values: OptionValue[];
}

interface SKURow {
  id: string;
  combination: string;
  sku: string;
  price: number;
  stock: number;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [productName, setProductName] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('Keyboard Kit');
  const [category, setCategory] = useState('Custom Mechanical');
  const [coverImage, setCoverImage] = useState<string>('');
  const [options, setOptions] = useState<Option[]>([
    { name: 'Case Color', values: [{ name: 'Anodized Black' }, { name: 'E-White' }, { name: 'Deep Blue' }] },
    { name: 'Plate Material', values: [{ name: 'Aluminum' }, { name: 'Brass' }, { name: 'FR4' }] },
  ]);
  const [skus, setSkus] = useState<SKURow[]>([
    { id: '1', combination: 'Black / Aluminum', sku: 'BLK-ALU-001', price: 349, stock: 50 },
    { id: '2', combination: 'Black / Brass', sku: 'BLK-BRS-002', price: 399, stock: 25 },
    { id: '3', combination: 'White / FR4', sku: 'WHT-FR4-003', price: 329, stock: 10 },
  ]);

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

  const handleLogout = () => {
    logoutAPI();
    toast.success('Đã đăng xuất!');
    router.push('/');
  };

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

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].values.splice(valueIndex, 1);
    setOptions(newOptions);
  };

  const updateSkuRow = (id: string, field: string, value: string | number) => {
    setSkus(
      skus.map((sku) =>
        sku.id === id
          ? {
              ...sku,
              [field]: field === 'price' || field === 'stock' ? parseFloat(value.toString()) : value,
            }
          : sku
      )
    );
  };

  const removeSkuRow = (id: string) => {
    setSkus(skus.filter((sku) => sku.id !== id));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!productName.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!description.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    if (skus.length === 0) {
      toast.error('Vui lòng thêm ít nhất một SKU');
      return;
    }

    setIsSubmitting(true);

    try {
      const request: CreateProductRequest = {
        name: productName,
        description: description,
        summary: summary || productName,
        cover: coverImage || 'https://via.placeholder.com/300',
        categoryId: 1,
        specifications: options.flatMap((opt) =>
          opt.values.map((val) => ({
            name: opt.name,
            value: val.name,
          }))
        ),
        skus: skus.map((sku) => ({
          sku: sku.sku,
          price: sku.price,
          quantity: sku.stock,
        })),
      };

      await createProductAPI(request);
      toast.success('Sản phẩm đã được tạo thành công!');
      router.push('/admin/inventory');
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error('Lỗi khi tạo sản phẩm');
    } finally {
      setIsSubmitting(false);
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
            <span className="font-label-md text-label-md uppercase tracking-widest">Inventory</span>
          </Link>

          <Link href="#" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all rounded-lg">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md text-label-md uppercase tracking-widest">Orders</span>
          </Link>
        </nav>

        <div className="px-8 mt-auto space-y-4">
          <Link href="/admin/create" className="w-full bg-primary text-white py-3 rounded-lg font-label-md uppercase tracking-widest hover:bg-primary-hover transition-colors active:scale-95 text-center block">
            New Product
          </Link>

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
            <span className="text-xl font-bold tracking-tight text-blue-900 dark:text-blue-50 font-h2">Add New Product</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-blue-600 transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="text-slate-500 hover:text-blue-600 transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button onClick={() => handlePublish({ preventDefault: () => {} } as React.FormEvent)} disabled={isSubmitting} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Submit New Product'}
            </button>
          </div>
        </header>

        {/* Form Content */}
        <form onSubmit={handlePublish} className="p-8 max-w-6xl mx-auto space-y-8">
          {/* Section 1: Basic Information */}
          <section className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-8 space-y-6">
              <div className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
                <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">info</span>
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-label-md font-label-md text-text-primary">Product Name</label>
                    <input
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md"
                      placeholder="e.g. Atelier Series-1 Custom Keyboard"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label-md font-label-md text-text-primary">Summary</label>
                    <input
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md"
                      placeholder="A brief catchphrase for the product listing"
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-label-md font-label-md text-text-primary">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md"
                      placeholder="Detailed product specifications and story..."
                      rows={6}
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-label-md font-label-md text-text-primary">Product Type</label>
                      <select
                        value={productType}
                        onChange={(e) => setProductType(e.target.value)}
                        className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md"
                      >
                        <option>Keyboard Kit</option>
                        <option>Pre-built Keyboard</option>
                        <option>Switches</option>
                        <option>Keycaps</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-label-md font-label-md text-text-primary">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md"
                      >
                        <option>Custom Mechanical</option>
                        <option>Artisan Edition</option>
                        <option>Accessories</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="col-span-12 md:col-span-4 space-y-6">
              <div className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
                <h3 className="text-label-md font-h3 text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-2">Media & Visuals</h3>

                <label className="relative aspect-square bg-surface-ivory border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center gap-2 group hover:border-secondary cursor-pointer transition-colors overflow-hidden">
                  {coverImage && <img alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" src={coverImage} />}
                  <span className="material-symbols-outlined text-h1 text-text-light group-hover:text-secondary z-10">add_photo_alternate</span>
                  <span className="text-label-sm font-label-sm text-text-light group-hover:text-secondary z-10">Upload Cover Image</span>
                  <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </section>

          {/* Section 2: Product Options */}
          <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">tune</span>
                Product Options
              </h3>
            </div>

            <div className="space-y-6">
              {options.map((option, optionIndex) => (
                <div key={optionIndex} className="p-6 bg-surface-ivory rounded-md border border-outline-variant/10 flex gap-6">
                  <div className="w-1/3 space-y-2">
                    <label className="text-label-sm font-label-sm text-text-secondary">Option Type</label>
                    <input className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-3 py-2 font-body-md" type="text" value={option.name} readOnly />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-label-sm font-label-sm text-text-secondary">Values</label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value, valueIndex) => (
                        <div key={valueIndex} className="flex items-center gap-1 bg-white border border-outline-variant px-3 py-1 rounded-full">
                          <span className="text-body-sm font-body-sm">{value.name}</span>
                          <button type="button" onClick={() => removeOptionValue(optionIndex, valueIndex)} className="text-text-light hover:text-error ml-1">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: SKU Management */}
          <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">list_alt</span>
                  SKU Management
                </h3>
                <p className="text-body-sm font-body-sm text-text-secondary">Manage inventory levels and pricing for each variant combination.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/10">
                    <th className="px-6 py-4 text-label-md font-label-md text-primary">Variant Combination</th>
                    <th className="px-6 py-4 text-label-md font-label-md text-primary">SKU Identifier</th>
                    <th className="px-6 py-4 text-label-md font-label-md text-primary">Base Price ($)</th>
                    <th className="px-6 py-4 text-label-md font-label-md text-primary">Stock Level</th>
                    <th className="px-6 py-4 text-label-md font-label-md text-primary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {skus.map((sku) => (
                    <tr key={sku.id} className="hover:bg-surface-ivory/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md">{sku.combination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-secondary font-semibold"
                          type="text"
                          value={sku.sku}
                          onChange={(e) => updateSkuRow(sku.id, 'sku', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          className="w-24 bg-white border border-outline-variant rounded-lg px-3 py-2 text-right font-body-md"
                          type="number"
                          value={sku.price}
                          onChange={(e) => updateSkuRow(sku.id, 'price', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          className="w-20 bg-white border border-outline-variant rounded-lg px-3 py-2 text-center font-body-md"
                          type="number"
                          value={sku.stock}
                          onChange={(e) => updateSkuRow(sku.id, 'stock', e.target.value)}
                        />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button type="button" onClick={() => removeSkuRow(sku.id)} className="text-text-light hover:text-error inline-block">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottom Action Cluster */}
          <div className="flex justify-end gap-4 pb-8">
            <Link href="/admin/inventory" className="px-8 py-3 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
              {isSubmitting ? 'Publishing...' : 'Publish Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}



