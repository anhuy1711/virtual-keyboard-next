'use client';

import { useState, useEffect, useCallback } from 'react';
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
  combination: string;          // "Black / Aluminum"
  optionValueIndexes: number[]; // indexes into each option's values array
  sku: string;
  price: number;
  stock: number;
  label?: string;               // optional sub-label, e.g. "Standard Edition"
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Cartesian product of arrays */
function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]]
  );
}

/** Build a slug-style SKU from value names, e.g. "Anodized Black" + "Aluminum" → "ANO-ALU" */
function slugSKU(names: string[], index: number): string {
  const parts = names.map((n) =>
      n
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .split(' ')
          .map((w) => w.slice(0, 3).toUpperCase())
          .join('')
  );
  return [...parts, String(index + 1).padStart(3, '0')].join('-');
}

/** Generate all SKU rows from current options */
function generateSKUs(options: Option[]): SKURow[] {
  const filled = options.filter((o) => o.name && o.values.length > 0);
  if (filled.length === 0) return [];

  const valueArrays = filled.map((o) => o.values.map((v) => v.name));
  const combos = cartesian(valueArrays);

  return combos.map((combo, i) => ({
    id: String(Date.now() + i),
    combination: combo.join(' / '),
    optionValueIndexes: combo.map((_, oi) =>
        filled[oi].values.findIndex((v) => v.name === combo[oi])
    ),
    sku: slugSKU(combo, i),
    price: 0,
    stock: 0,
    label: '',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────

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
  const [productType, setProductType] = useState('KIT');
  const [category, setCategory] = useState('Custom Mechanical');
  const [coverImage, setCoverImage] = useState<string>('');

  const [options, setOptions] = useState<Option[]>([
    { name: 'Case Color', values: [{ name: 'Anodized Black' }, { name: 'E-White' }, { name: 'Deep Blue' }] },
    { name: 'Plate Material', values: [{ name: 'Aluminum' }, { name: 'Brass' }, { name: 'FR4' }] },
  ]);
  const [addValueInputs, setAddValueInputs] = useState<string[]>(['', '']);

  const [skus, setSkus] = useState<SKURow[]>([
    { id: '1', combination: 'Black / Aluminum', optionValueIndexes: [0, 0], sku: 'BLK-ALU-001', price: 349, stock: 50, label: 'Standard Edition' },
    { id: '2', combination: 'Black / Brass',    optionValueIndexes: [0, 1], sku: 'BLK-BRS-002', price: 399, stock: 25, label: 'Premium Edition'  },
    { id: '3', combination: 'White / FR4',      optionValueIndexes: [1, 2], sku: 'WHT-FR4-003', price: 329, stock: 10, label: 'Atelier Special'  },
  ]);

  // Which row is in edit mode (null = none)
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── auth ──────────────────────────────────────────────────────────────────
  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    if (!isMounted) return;
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    try {
      const decoded = jwtDecode(token) as { role?: string };
      if (decoded.role?.toUpperCase() !== 'ADMIN') { router.push('/'); return; }
      setIsAuthorized(true);
    } catch { router.push('/login'); }
    finally { setIsLoading(false); }
  }, [router, isMounted]);

  const handleLogout = () => { logoutAPI(); toast.success('Đã đăng xuất!'); router.push('/'); };

  // ── media ─────────────────────────────────────────────────────────────────
  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ── option helpers ────────────────────────────────────────────────────────
  const addOptionType = () => {
    setOptions([...options, { name: '', values: [] }]);
    setAddValueInputs([...addValueInputs, '']);
  };
  const updateOptionName = (i: number, name: string) => {
    const next = [...options]; next[i] = { ...next[i], name }; setOptions(next);
  };
  const removeOptionType = (i: number) => {
    setOptions(options.filter((_, idx) => idx !== i));
    setAddValueInputs(addValueInputs.filter((_, idx) => idx !== i));
  };
  const removeOptionValue = (oi: number, vi: number) => {
    const next = [...options];
    next[oi].values = next[oi].values.filter((_, idx) => idx !== vi);
    setOptions(next);
  };
  const commitAddValue = (oi: number) => {
    const raw = addValueInputs[oi]?.trim();
    if (!raw) return;
    const next = [...options];
    next[oi].values = [...next[oi].values, { name: raw }];
    setOptions(next);
    const inputs = [...addValueInputs]; inputs[oi] = ''; setAddValueInputs(inputs);
  };
  const handleAddValueKeyDown = (e: React.KeyboardEvent, oi: number) => {
    if (e.key === 'Enter') { e.preventDefault(); commitAddValue(oi); }
  };

  // ── SKU helpers ───────────────────────────────────────────────────────────
  const regenerateSKUs = () => {
    const generated = generateSKUs(options);
    if (generated.length === 0) {
      toast.warn('Add at least one option with values first.');
      return;
    }
    // Preserve existing price/stock/label if combination name matches
    const existing = new Map(skus.map((s) => [s.combination, s]));
    setSkus(
        generated.map((g) => {
          const prev = existing.get(g.combination);
          return prev ? { ...g, id: prev.id, price: prev.price, stock: prev.stock, label: prev.label, sku: prev.sku } : g;
        })
    );
    toast.success('SKUs regenerated from options.');
  };

  const updateSkuRow = (id: string, field: keyof SKURow, value: string | number) => {
    setSkus(skus.map((s) =>
        s.id === id
            ? { ...s, [field]: (field === 'price' || field === 'stock') ? parseFloat(String(value)) : value }
            : s
    ));
  };

  const removeSkuRow = (id: string) => setSkus(skus.filter((s) => s.id !== id));

  // ── submit ────────────────────────────────────────────────────────────────
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const request: CreateProductRequest = {
        name: productName,
        description,
        summary: summary || productName,
        cover: coverImage || 'https://via.placeholder.com/300',
        type: productType || 'KIT',
        categoryId: 1,
        specifications: options.flatMap((opt) => opt.values.map((val) => ({ name: opt.name, value: val.name }))),
        options: options.map((opt) => ({ name: opt.name, values: opt.values.map((v) => v.name) })),
        skus: skus.map((sku) => ({ price: sku.price, quantity: sku.stock, optionValueIndexes: sku.optionValueIndexes })),
      };
      await createProductAPI(request);
      toast.success('Sản phẩm đã được tạo thành công!');
      router.push('/admin/inventory');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tạo sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── guards ────────────────────────────────────────────────────────────────
  if (!isMounted || isLoading) return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
  );
  if (!isAuthorized) return null;

  // ── render ────────────────────────────────────────────────────────────────
  return (
      <div className="flex h-screen bg-surface-ivory">

        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full flex flex-col py-8 bg-surface-bright dark:bg-dark-surface w-64 hidden md:flex z-50 border-r border-outline-variant/10">
          <div className="px-8 mb-10">
            <h1 className="text-lg font-black text-blue-900 dark:text-blue-50 uppercase tracking-tight">Admin Panel</h1>
            <p className="font-label-sm text-label-sm text-slate-500">Elite Keyboards</p>
          </div>
          <nav className="flex-1 space-y-2">
            <Link href="/admin" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 transition-all rounded-lg">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-label-md text-label-md uppercase tracking-widest">Dashboard</span>
            </Link>
            <Link href="/admin/inventory" className="flex items-center space-x-4 py-3 text-blue-900 font-bold border-l-4 border-blue-900 pl-4 bg-surface-container-low">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>keyboard</span>
              <span className="font-label-md text-label-md uppercase tracking-widest">Inventory</span>
            </Link>
            <Link href="#" className="flex items-center space-x-4 py-3 text-slate-500 pl-5 hover:bg-slate-200/50 transition-all rounded-lg">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="font-label-md text-label-md uppercase tracking-widest">Orders</span>
            </Link>
          </nav>
          <div className="px-8 mt-auto space-y-4">
            <Link href="/admin/create" className="w-full bg-primary text-white py-3 rounded-lg font-label-md uppercase tracking-widest hover:bg-primary-hover transition-colors active:scale-95 text-center block">New Product</Link>
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

        {/* Main */}
        <main className="md:ml-64 w-full overflow-auto pb-20 md:pb-0">
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center w-full px-6 py-3 h-16 shadow-sm border-b border-outline-variant/10">
            <span className="text-xl font-bold tracking-tight text-blue-900 font-h2">Add New Product</span>
            <div className="flex items-center gap-6">
              <button className="text-slate-500 hover:text-blue-600 relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="text-slate-500 hover:text-blue-600"><span className="material-symbols-outlined">settings</span></button>
              <button onClick={() => handlePublish({ preventDefault: () => {} } as React.FormEvent)} disabled={isSubmitting} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-hover transition-colors disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit New Product'}
              </button>
            </div>
          </header>

          <form onSubmit={handlePublish} className="p-8 max-w-6xl mx-auto space-y-8">

            {/* Section 1: Basic Information */}
            <section className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
                  <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span>Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-label-md font-label-md text-text-primary">Product Name</label>
                      <input value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md" placeholder="e.g. Atelier Series-1 Custom Keyboard" type="text" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label-md font-label-md text-text-primary">Summary</label>
                      <input value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md" placeholder="A brief catchphrase for the product listing" type="text" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label-md font-label-md text-text-primary">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md" rows={6} placeholder="Detailed product specifications and story..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-label-md font-label-md text-text-primary">Product Type</label>
                        <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md">
                          <option>KIT</option><option>PREBUILT</option><option>KEYCAP</option><option>SWITCH</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-label-md font-label-md text-text-primary">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md">
                          <option>Custom Mechanical</option><option>Artisan Edition</option><option>Accessories</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
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
                  <span className="material-symbols-outlined">tune</span>Product Options
                </h3>
                <button type="button" onClick={addOptionType} className="flex items-center gap-1 text-secondary font-label-md text-label-md hover:underline">
                  <span className="material-symbols-outlined text-base">add_circle</span>Add Option Type
                </button>
              </div>
              {options.length === 0 && (
                  <p className="text-body-sm text-text-light text-center py-6 border border-dashed border-outline-variant rounded-lg">
                    No options yet. Click "Add Option Type" to get started.
                  </p>
              )}
              <div className="space-y-4">
                {options.map((option, oi) => (
                    <div key={oi} className="p-6 bg-surface-ivory rounded-md border border-outline-variant/10 flex gap-6 relative group">
                      <div className="w-1/3 space-y-2 shrink-0">
                        <label className="text-label-sm font-label-sm text-text-secondary">Option Type</label>
                        <input className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-3 py-2 font-body-md" type="text" placeholder="e.g. Case Color" value={option.name} onChange={(e) => updateOptionName(oi, e.target.value)} />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <label className="text-label-sm font-label-sm text-text-secondary">Values</label>
                        <div className="flex flex-wrap gap-2 items-center">
                          {option.values.map((v, vi) => (
                              <div key={vi} className="flex items-center gap-1 bg-white border border-outline-variant px-3 py-1 rounded-full">
                                <span className="text-body-sm font-body-sm">{v.name}</span>
                                <button type="button" onClick={() => removeOptionValue(oi, vi)} className="text-text-light hover:text-error ml-1 leading-none">
                                  <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                              </div>
                          ))}
                          <div className="flex items-center gap-1 bg-white border border-dashed border-outline-variant rounded-full px-2 py-1 focus-within:border-secondary transition-colors">
                            <input type="text" className="bg-transparent border-none outline-none text-body-sm font-body-sm w-28 placeholder:text-text-light" placeholder="Add value…"
                                   value={addValueInputs[oi] ?? ''}
                                   onChange={(e) => { const n = [...addValueInputs]; n[oi] = e.target.value; setAddValueInputs(n); }}
                                   onKeyDown={(e) => handleAddValueKeyDown(e, oi)}
                            />
                            <button type="button" onClick={() => commitAddValue(oi)} className="text-secondary hover:text-primary leading-none">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-label-sm text-text-light">Press Enter or ✓ to confirm each value.</p>
                      </div>
                      <button type="button" onClick={() => removeOptionType(oi)} className="absolute -top-2.5 -right-2.5 bg-white text-error border border-error rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                ))}
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════════
              Section 3: SKU Management  — ĐÃ SỬA
          ═══════════════════════════════════════════════════════════════════ */}
            <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">list_alt</span>SKU Management
                  </h3>
                  <p className="text-body-sm font-body-sm text-text-secondary">
                    Manage inventory levels and pricing for each variant combination.
                  </p>
                </div>

                {/* Regenerate button */}
                <button
                    type="button"
                    onClick={regenerateSKUs}
                    className="flex items-center gap-1.5 bg-surface-container text-primary px-4 py-2 rounded-lg font-label-md text-label-md border border-primary/10 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Regenerate SKUs
                </button>
              </div>

              {skus.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-outline-variant rounded-lg">
                    <span className="material-symbols-outlined text-4xl text-text-light block mb-2">inventory_2</span>
                    <p className="text-body-sm text-text-light">No SKUs yet.</p>
                    <p className="text-label-sm text-text-light mt-1">
                      Define options above then click <strong>Regenerate SKUs</strong>.
                    </p>
                  </div>
              ) : (
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
                      {skus.map((sku) => {
                        const isEditing = editingId === sku.id;
                        return (
                            <tr key={sku.id} className="hover:bg-surface-ivory/50 transition-colors">

                              {/* Combination + label */}
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-label-md text-label-md">{sku.combination}</span>
                                  {isEditing ? (
                                      <input
                                          type="text"
                                          value={sku.label ?? ''}
                                          onChange={(e) => updateSkuRow(sku.id, 'label', e.target.value)}
                                          placeholder="Sub-label (optional)"
                                          className="text-xs border border-outline-variant rounded px-2 py-0.5 w-40 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                                      />
                                  ) : (
                                      sku.label && <span className="text-xs text-text-light">{sku.label}</span>
                                  )}
                                </div>
                              </td>

                              {/* SKU identifier */}
                              <td className="px-6 py-4">
                                <input
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-secondary font-semibold outline-none"
                                    type="text"
                                    value={sku.sku}
                                    onChange={(e) => updateSkuRow(sku.id, 'sku', e.target.value)}
                                />
                              </td>

                              {/* Price */}
                              <td className="px-6 py-4">
                                <input
                                    className="w-24 bg-white border border-outline-variant rounded-lg px-3 py-2 text-right font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={sku.price}
                                    onChange={(e) => updateSkuRow(sku.id, 'price', e.target.value)}
                                />
                              </td>

                              {/* Stock */}
                              <td className="px-6 py-4">
                                <input
                                    className="w-20 bg-white border border-outline-variant rounded-lg px-3 py-2 text-center font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                                    type="number"
                                    min={0}
                                    value={sku.stock}
                                    onChange={(e) => updateSkuRow(sku.id, 'stock', e.target.value)}
                                />
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingId(isEditing ? null : sku.id)}
                                    className={`inline-block transition-colors ${isEditing ? 'text-secondary' : 'text-text-light hover:text-primary'}`}
                                    title={isEditing ? 'Done editing' : 'Edit label'}
                                >
                              <span className="material-symbols-outlined text-lg">
                                {isEditing ? 'check_circle' : 'edit'}
                              </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeSkuRow(sku.id)}
                                    className="text-text-light hover:text-error inline-block transition-colors"
                                    title="Remove SKU"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </td>
                            </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
              )}
            </section>
            {/* ═══════════════════════════════════════════════════ end Section 3 */}

            <div className="flex justify-end gap-4 pb-8">
              <Link href="/admin/inventory" className="px-8 py-3 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">Cancel</Link>
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-lg">
                {isSubmitting ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </form>
        </main>
      </div>
  );
}