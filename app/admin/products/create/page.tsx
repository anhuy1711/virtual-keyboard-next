'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { jwtDecode } from 'jwt-decode';
import { createProductAPI, CreateProductRequest } from '@/app/services/productService';
import { toast } from 'react-toastify';

interface TabField {
  name: string;
  value: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'variants' | 'specs'>('info');

  // Form state - Product Info
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('1');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');

  // Form state - Variants
  const [colors, setColors] = useState(['Midnight Navy', 'Arctic White']);
  const [newColor, setNewColor] = useState('');
  
  // Mock data for display
  const layouts = ['ANSI'];
  const variants = [
    { id: 1, combination: 'Midnight Navy / ANSI', price: '349.00', quantity: '10' },
    { id: 2, combination: 'Arctic White / ANSI', price: '349.00', quantity: '5' },
  ];

  // Form state - Specs
  const [specs, setSpecs] = useState<TabField[]>([
    { name: 'Mounting Style', value: 'Gasket Mount' },
  ]);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token) as { role: string; sub: string };
      const userRole = decoded.role;

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
  }, [router]);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setCoverImage(base64String);
        setCoverImagePreview(base64String);
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

  const handleSaveClick = async () => {
    console.log('🔵 handleSaveClick triggered!');
    console.log('📝 Form data:', { productName, description, coverImage: coverImage ? 'Base64 loaded' : 'No image', category, specs, variants });

    // VALIDATION DISABLED FOR TESTING

    setIsSaving(true);
    console.log('⏳ setIsSaving(true) called');

    try {
      console.log('🔄 Creating request object...');
      const request: CreateProductRequest = {
        name: productName || 'Test Product',
        description: description || 'Test Description',
        summary: summary || productName || 'Test Summary',
        cover: coverImage || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        categoryId: parseInt(category) || 1,
        specifications: specs.map(spec => ({
          name: spec.name || 'Default Spec',
          value: spec.value || 'Default Value',
        })),
        skus: variants.map(variant => ({
          price: parseFloat(variant.price) || 100,
          quantity: parseInt(variant.quantity) || 1,
          sizeAttributeId: 1,
          colorAttributeId: 1,
          layoutAttributeId: 1,
        })),
      };

      console.log('✅ Request object created:', request);
      console.log('🚀 About to call createProductAPI...');
      
      const result = await createProductAPI(request);
      
      console.log('✅ API Response received:', result);
      toast.success('Tạo sản phẩm thành công!');
      alert('✅ PRODUCT CREATED SUCCESSFULLY! Redirecting...');

      setTimeout(() => {
        alert('🔄 Redirecting to /admin');
        router.push('/admin');
      }, 1500);
      }, 1500);
    } catch (error) {
      console.error('❌ FULL ERROR OBJECT:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ Error message:', errorMsg);
      alert('❌ ERROR: ' + errorMsg);
      toast.error(errorMsg);
    } finally {
      console.log('🏁 Finally block - setting isSaving to false');
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('📋 handleSubmit form event triggered!');
    await handleSaveClick();
  };

  const handleDiscard = () => {
    if (window.confirm('Bạn chắc chắn muốn hủy? Tất cả thay đổi sẽ bị mất.')) {
      router.push('/admin');
    }
  };

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

  return (
    <div className="flex min-h-screen bg-surface-ivory">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-[#FDFCFB] flex flex-col p-4 space-y-2 sticky top-0 h-screen">
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-primary font-headline tracking-tight">The Atelier</h1>
          <p className="text-sm text-text-secondary">Management Console</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md">Dashboard</span>
          </a>
          <a
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-900 font-semibold rounded-lg"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              keyboard
            </span>
            <span className="font-label-md">Products</span>
          </a>
          <a
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-label-md">Orders</span>
          </a>
          <a
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-label-md">Inventory</span>
          </a>
          <a
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50/50 transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md">Settings</span>
          </a>
        </nav>
        <div className="mt-auto p-2">
          <button
            onClick={() => {
              document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-2.5 bg-primary text-on-primary font-label-md rounded hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Product
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-8 py-3 sticky top-0 bg-[#FDFCFB]/80 backdrop-blur-xl border-b border-slate-200 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-slate-100 rounded-md transition-transform active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="font-semibold text-slate-900 text-lg">Add New Product</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => console.log('🧪 TEST BUTTON CLICKED')}
              className="px-3 py-2 bg-yellow-500 text-white rounded text-xs font-bold"
            >
              TEST
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="px-4 py-2 text-slate-600 font-label-md hover:bg-slate-100 rounded transition-transform active:scale-95"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={async (e) => {
                e.preventDefault();
                console.log('💾 Save button clicked directly!');
                await handleSaveClick();
              }}
              className="px-6 py-2 bg-primary text-on-primary font-label-md rounded hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isSaving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="bg-[#FDFCFB] border-b border-slate-200 px-8 sticky top-[57px] z-30">
          <div className="flex gap-8 max-w-4xl">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 font-label-md transition-colors relative ${
                activeTab === 'info'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 hover:text-primary border-b-2 border-transparent'
              }`}
            >
              Thông tin sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`py-4 font-label-md transition-colors relative ${
                activeTab === 'variants'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 hover:text-primary border-b-2 border-transparent'
              }`}
            >
              Biến thể & SKU
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 font-label-md transition-colors relative ${
                activeTab === 'specs'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 hover:text-primary border-b-2 border-transparent'
              }`}
            >
              Thông số kỹ thuật
            </button>
          </div>
        </div>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto p-8">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {/* Tab 1: Product Info */}
            {activeTab === 'info' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                    inventory_2
                  </span>
                  <h3 className="text-2xl font-semibold text-text-primary">Thông tin sản phẩm</h3>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                  {/* Product Name & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-label-sm text-text-secondary mb-1.5 ml-0.5">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Atelier Pro-65 Mechanical Keyboard"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md"
                      />
                    </div>
                    <div>
                      <label className="block font-label-sm text-text-secondary mb-1.5 ml-0.5">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full appearance-none px-4 py-2.5 rounded-lg border border-slate-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md bg-white"
                        >
                          <option value="1">Custom Keyboards</option>
                          <option value="2">Switches</option>
                          <option value="3">Keycaps</option>
                          <option value="4">Accessories</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="block font-label-sm text-text-secondary mb-1.5 ml-0.5">
                      Summary
                    </label>
                    <input
                      type="text"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Brief description for the product"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all font-body-md"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-label-sm text-text-secondary mb-1.5 ml-0.5">
                      Description
                    </label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the craftsmanship and technical details..."
                        className="w-full px-4 py-3 border-none focus:ring-0 outline-none font-body-md resize-none"
                        rows={5}
                      ></textarea>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block font-label-sm text-text-secondary mb-1.5 ml-0.5">
                      Cover Image
                    </label>
                    {coverImagePreview ? (
                      <div className="relative">
                        <Image
                          src={coverImagePreview}
                          alt="Cover preview"
                          width={1200}
                          height={800}
                          className="w-full max-h-96 object-cover rounded-xl border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImage('');
                            setCoverImagePreview('');
                          }}
                          className="absolute top-2 right-2 p-2 bg-error text-on-error rounded-full hover:bg-red-700 transition-colors"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 bg-slate-50/50 group hover:border-secondary hover:bg-blue-50/30 transition-all cursor-pointer">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-2xl text-primary">
                            add_a_photo
                          </span>
                        </div>
                        <p className="font-label-md text-text-primary mb-1">
                          Click to upload cover image
                        </p>
                        <p className="text-label-sm text-text-light">Recommended size: 1200x800px</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Variants & SKU */}
            {activeTab === 'variants' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                    style
                  </span>
                  <h3 className="text-2xl font-semibold text-text-primary">Biến thể & SKU</h3>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-[#FDFCFB] space-y-4">
                    <p className="font-label-md text-text-primary">Select Attributes</p>

                    {/* Colors */}
                    <div>
                      <label className="text-label-sm text-text-secondary block mb-2 uppercase tracking-wide">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <span
                            key={color}
                            className="inline-flex items-center px-3 py-1.5 rounded-full border border-secondary bg-blue-50 text-secondary font-label-md"
                          >
                            {color}
                          </span>
                        ))}
                        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
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
                            placeholder="New color..."
                            className="px-3 py-1.5 h-[38px] text-body-sm border border-slate-200 rounded-full focus:ring-1 focus:ring-secondary focus:border-secondary outline-none bg-transparent w-32"
                          />
                          <button
                            type="button"
                            onClick={addColor}
                            className="flex items-center justify-center p-1.5 h-[38px] w-[38px] text-primary border border-primary/20 hover:bg-primary/5 rounded-full transition-colors"
                          >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Layouts */}
                    <div>
                      <label className="text-label-sm text-text-secondary block mb-2 uppercase tracking-wide">
                        Layout
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {layouts.map((layout) => (
                          <span
                            key={layout}
                            className="inline-flex items-center px-3 py-1.5 rounded-full border border-secondary bg-blue-50 text-secondary font-label-md"
                          >
                            {layout}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-label-md text-text-secondary uppercase tracking-wider text-[11px]">
                            Combination
                          </th>
                          <th className="px-6 py-4 font-label-md text-text-secondary uppercase tracking-wider text-[11px]">
                            Price (USD)
                          </th>
                          <th className="px-6 py-4 font-label-md text-text-secondary uppercase tracking-wider text-[11px]">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {variants.map((variant) => (
                          <tr key={variant.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-label-md text-text-primary">
                              {variant.combination}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-body-sm">${variant.price}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-body-sm">{variant.quantity} units</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-label-sm text-text-light text-center">
                  Variants are auto-generated from selected attributes. Customize in the table above.
                </p>
              </div>
            )}

            {/* Tab 3: Technical Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">
                      settings_suggest
                    </span>
                    <h3 className="text-2xl font-semibold text-text-primary">Thông số kỹ thuật</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addSpec}
                    disabled={!newSpecName.trim() || !newSpecValue.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-primary border border-primary/20 hover:bg-primary/5 disabled:opacity-50 font-label-md rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add Field
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  {/* Existing Specs */}
                  {specs.map((spec, index) => (
                    <div key={index} className="flex gap-4 items-center pb-4 border-b border-slate-100 last:border-b-0">
                      <div className="flex-1">
                        <label className="block font-label-sm text-text-light mb-1 ml-0.5">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={spec.name}
                          readOnly
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 font-body-md text-slate-500"
                        />
                      </div>
                      <div className="flex-[1.5]">
                        <label className="block font-label-sm text-text-light mb-1 ml-0.5">
                          Value
                        </label>
                        <input
                          type="text"
                          value={spec.value}
                          readOnly
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 font-body-md text-slate-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpec(index)}
                        className="mt-6 p-2 text-slate-400 hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}

                  {/* New Spec Input */}
                  <div className="flex gap-4 items-center pt-4 border-t border-slate-100">
                    <div className="flex-1">
                      <label className="block font-label-sm text-text-light mb-1 ml-0.5">
                        Field Name
                      </label>
                      <input
                        type="text"
                        value={newSpecName}
                        onChange={(e) => setNewSpecName(e.target.value)}
                        placeholder="e.g. PCB Type"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-secondary outline-none font-body-md"
                      />
                    </div>
                    <div className="flex-[1.5]">
                      <label className="block font-label-sm text-text-light mb-1 ml-0.5">
                        Value
                      </label>
                      <input
                        type="text"
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        placeholder="e.g. Hotswap 1.2mm"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-secondary outline-none font-body-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addSpec}
                      disabled={!newSpecName.trim() || !newSpecValue.trim()}
                      className="mt-6 px-4 py-2 bg-primary text-on-primary rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-8 pb-12 flex justify-center">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full max-w-md py-4 bg-primary text-on-primary font-semibold text-lg rounded-xl shadow-lg hover:bg-primary-hover disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">save</span>
                {isSaving ? 'Saving...' : 'Save Product & Variants'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}








