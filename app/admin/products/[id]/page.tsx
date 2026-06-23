'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Link from 'next/link';
import { getProductDetailAPI, updateProductAPI, CreateProductRequest } from '@/app/services/productService';
import { logoutAPI } from '@/app/services/authService';
import { toast } from 'react-toastify';
import { uploadProductImageAPI } from '@/app/services/uploadService';

interface OptionValue {
  id?: number;
  name: string;
}

interface Option {
  id?: number;
  name: string;
  values: OptionValue[];
}

interface Specification {
  id?: number;
  name: string;
  value: string;
}

interface SKURow {
  id?: number;
  combination: string;
  optionValueIndexes: number[];
  sku: string;
  imageUrl?: string;
  price: number;
  stock: number;
  isActive?: boolean;
  label?: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [[]];
  return arrays.reduce<T[][]>(
      (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
      [[]]
  );
}

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

function generateSKUs(options: Option[]): SKURow[] {
  const filled = options.filter((o) => o.name && o.values.length > 0);
  if (filled.length === 0) return [];

  const valueArrays = filled.map((o) => o.values.map((v) => v.name));
  const combos = cartesian(valueArrays);

  return combos.map((combo, i) => ({
    id: undefined,
    combination: combo.join(' / '),
    optionValueIndexes: combo.map((_, oi) =>
        filled[oi].values.findIndex((v) => v.name === combo[oi])
    ),
    sku: slugSKU(combo, i),
    imageUrl: '',
    price: 0,
    stock: 0,
    isActive: true,
    label: '',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id ? parseInt(String(params.id)) : null;

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [productName, setProductName] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState('KIT');
  const [requiredSwitchCount, setRequiredSwitchCount] = useState<number | ''>('');
  const [category, setCategory] = useState('Custom Mechanical');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [addSpecInput, setAddSpecInput] = useState({ name: '', value: '' });

  const [options, setOptions] = useState<Option[]>([]);
  const [addValueInputs, setAddValueInputs] = useState<string[]>([]);

  const [skus, setSkus] = useState<SKURow[]>([]);
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

  // ── load product data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthorized || !productId) return;

    (async () => {
      try {
        const product = await getProductDetailAPI(productId);

        setProductName(product.name);
        setSummary(product.summary);
        setDescription(product.description);
        setCoverImage(product.cover);
        setProductType(product.type || 'KIT');
        setRequiredSwitchCount(product.requiredSwitchCount || '');

        // Load specifications
        setSpecifications(
            product.specifications.map((spec) => ({
              id: spec.id,
              name: spec.name,
              value: spec.value,
            }))
        );

        // Load options
        const loadedOptions = product.options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          values: opt.values.map((v) => ({ id: v.id, name: v.value })),
        }));
        setOptions(loadedOptions);
        setAddValueInputs(new Array(loadedOptions.length).fill(''));

        // Load SKUs
        const loadedSkus = product.skus.map((sku) => ({
          id: sku.id,
          combination: loadedOptions
              .map((opt, oi) => opt.values.find(v => v.id === sku.optionValueIds[oi])?.name || '')
              .join(' / '),
          optionValueIndexes: loadedOptions.map((opt, oi) =>
              opt.values.findIndex(v => v.id === sku.optionValueIds[oi])
          ),
          sku: sku.sku,
          imageUrl: sku.imageUrl,
          price: sku.price,
          stock: sku.quantity,
          isActive: sku.isActive,
          label: '',
        }));
        setSkus(loadedSkus);
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi tải dữ liệu sản phẩm');
      }
    })();
  }, [isAuthorized, productId]);

  const handleLogout = () => { logoutAPI(); toast.success('Đã đăng xuất!'); router.push('/'); };

  // ── media ─────────────────────────────────────────────────────────────────
  const handleCoverImageUpload = async (
      e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    try {
      setIsUploadingImage(true);

      const imageUrl = await uploadProductImageAPI(file);

      setCoverImage(imageUrl);
      toast.success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Upload image error:', error);
      toast.error('Tải ảnh lên thất bại');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ── specification helpers ─────────────────────────────────────────────────
  const addSpecification = () => {
    if (!addSpecInput.name || !addSpecInput.value) {
      toast.warn('Nhập cả tên và giá trị');
      return;
    }
    setSpecifications([...specifications, { name: addSpecInput.name, value: addSpecInput.value }]);
    setAddSpecInput({ name: '', value: '' });
  };
  const removeSpecification = (i: number) => {
    setSpecifications(specifications.filter((_, idx) => idx !== i));
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
      toast.warn('Thêm ít nhất một option với values trước');
      return;
    }
    const existing = new Map(skus.map((s) => [s.combination, s]));
    setSkus(
        generated.map((g) => {
          const prev = existing.get(g.combination);
          return prev
              ? { ...g, id: prev.id, price: prev.price, stock: prev.stock, label: prev.label, sku: prev.sku, imageUrl: prev.imageUrl, isActive: prev.isActive }
              : g;
        })
    );
    toast.success('SKUs đã được tạo lại từ options');
  };

  const updateSkuRow = (
      id: number | string | undefined,
      field: keyof SKURow,
      value: string | number | boolean
  ) => {
    setSkus(skus.map((s) =>
        (s.id?.toString() === id?.toString() || (s.id === undefined && String(skus.indexOf(s)) === id?.toString()))
            ? { ...s, [field]: (field === 'price' || field === 'stock') ? parseFloat(String(value)) : value }
            : s
    ));
  };

  const removeSkuRow = (id: string | undefined) => {
    setSkus(skus.filter((s) => !(s.id?.toString() === id || (s.id === undefined && String(skus.indexOf(s)) === id))));
  };

  const handleSkuImageUpload = async (rowKey: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    try {
      const imageUrl = await uploadProductImageAPI(file);
      setSkus((current) =>
          current.map((sku, index) => {
            const key = sku.id?.toString() || String(index);
            return key === rowKey ? { ...sku, imageUrl } : sku;
          })
      );
      toast.success('Đã tải ảnh SKU');
    } catch (error) {
      console.error('Upload SKU image error:', error);
      toast.error('Tải ảnh SKU thất bại');
    }
  };

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error('Không tìm thấy ID sản phẩm');
      return;
    }
    setIsSubmitting(true);
    try {
      const request: CreateProductRequest = {
        name: productName,
        description,
        summary: summary || productName,
        cover: coverImage || 'https://via.placeholder.com/300',
        type: productType || 'KIT',
        categoryId: 1,
        requiredSwitchCount: productType === 'KIT' && requiredSwitchCount !== ''
            ? Number(requiredSwitchCount)
            : undefined,

        specifications: specifications.map((spec) => ({
          name: spec.name,
          value: spec.value,
        })),

        options: options.map((opt) => ({
          id: opt.id,
          name: opt.name,
          values: opt.values.map((v) => ({
            id: v.id,
            value: v.name,
          })),
        })),

        skus: skus.map((sku) => ({
          id: sku.id,
          sku: sku.sku,
          imageUrl: sku.imageUrl,
          price: sku.price,
          quantity: sku.stock,
          optionValueIds: sku.optionValueIndexes
              .map((vi, oi) => options[oi]?.values[vi]?.id)
              .filter((id): id is number => id !== undefined && id !== null),
        })),
      };
      await updateProductAPI(productId, request);
      toast.success('Sản phẩm đã được cập nhật thành công!');
      router.push('/admin/inventory');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi cập nhật sản phẩm');
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
        {/* Main */}
        <main className="w-full pb-20 md:pb-0">
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center w-full px-6 py-3 h-16 shadow-sm border-b border-outline-variant/10">
            <div className="flex items-center gap-4">
              <Link href="/admin/inventory" className="p-1 hover:bg-slate-100 rounded-md transition-colors">
                <span className="material-symbols-outlined text-slate-600">arrow_back</span>
              </Link>
              <span className="text-xl font-bold tracking-tight text-blue-900 font-h2">Chỉnh sửa sản phẩm</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="text-slate-500 hover:text-blue-600 relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button onClick={() => handleSave({ preventDefault: () => {} } as React.FormEvent)} disabled={isSubmitting} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:bg-primary-hover transition-colors disabled:opacity-50">
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </header>

          <form onSubmit={handleSave} className="p-8 max-w-6xl mx-auto space-y-8">

            {/* Section 1: Basic Information */}
            <section className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
                  <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span>Thông tin cơ bản
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-label-md font-label-md text-text-primary">Tên sản phẩm</label>
                      <input value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md" type="text" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label-md font-label-md text-text-primary">Tóm tắt</label>
                      <input value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md" type="text" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-label-md font-label-md text-text-primary">Mô tả chi tiết</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md" rows={6} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-label-md font-label-md text-text-primary">Loai san pham</label>
                        <select value={productType} onChange={(e) => setProductType(e.target.value)} className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md">
                          <option>KIT</option><option>PREBUILT</option><option>KEYCAP</option><option>SWITCH</option>
                        </select>
                      </div>
                      {productType === 'KIT' && (
                          <div className="flex flex-col gap-2">
                            <label className="text-label-md font-label-md text-text-primary">So switch can dung</label>
                            <input
                                value={requiredSwitchCount}
                                onChange={(e) => setRequiredSwitchCount(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-4 py-2 font-body-md"
                                min={1}
                                placeholder="VD: 67"
                                type="number"
                            />
                          </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
                  <h3 className="text-label-md font-h3 text-primary uppercase tracking-widest border-b border-outline-variant/10 pb-2">
                    Ảnh bìa
                  </h3>

                  <label className="relative aspect-square bg-surface-ivory border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center gap-2 group hover:border-secondary cursor-pointer transition-colors overflow-hidden">
                    {coverImage && (
                        <img
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                            src={coverImage}
                        />
                    )}

                    {!coverImage && (
                        <>
          <span className="material-symbols-outlined text-h1 text-text-light group-hover:text-secondary z-10">
            add_photo_alternate
          </span>

                          <span className="text-label-sm font-label-sm text-text-light group-hover:text-secondary z-10">
            Tải ảnh lên
          </span>
                        </>
                    )}

                    {isUploadingImage && (
                        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-20">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                          <span className="text-sm text-primary font-semibold">
            Đang tải ảnh...
          </span>
                        </div>
                    )}

                    {coverImage && !isUploadingImage && (
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <span className="text-white text-sm font-bold">
            Bấm để đổi ảnh
          </span>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                    />
                  </label>

                  {coverImage && (
                      <p className="text-xs text-text-light break-all">
                        {coverImage}
                      </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Specifications */}
            {/* Section 2: Specifications */}
            <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">list_alt</span>Thông số kỹ thuật
                </h3>
              </div>

              {/* Input thêm mới */}
              <div className="flex gap-3 items-end">
                <input
                    className="flex-1 border border-outline-variant rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                    type="text"
                    placeholder="Tên thông số"
                    value={addSpecInput.name}
                    onChange={(e) => setAddSpecInput(prev => ({ ...prev, name: e.target.value }))}
                />
                <input
                    className="flex-1 border border-outline-variant rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                    type="text"
                    placeholder="Giá trị"
                    value={addSpecInput.value}
                    onChange={(e) => setAddSpecInput(prev => ({ ...prev, value: e.target.value }))}
                />
                <button
                    type="button"
                    onClick={addSpecification}
                    className="flex items-center gap-1 text-secondary font-label-md text-label-md hover:underline whitespace-nowrap p-2"
                >
                  <span className="material-symbols-outlined text-base">add_circle</span>Thêm cặp
                </button>
              </div>

              {/* Danh sách đã thêm */}
              <div className="space-y-3">
                {specifications.map((spec, i) => (
                    <div key={i} className="flex gap-3 items-end">
                      <input
                          className="flex-1 border border-outline-variant rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                          type="text"
                          placeholder="Tên thông số"
                          value={spec.name}
                          onChange={(e) =>
                              setSpecifications(prev =>
                                  prev.map((s, idx) => idx === i ? { ...s, name: e.target.value } : s)
                              )
                          }
                      />
                      <input
                          className="flex-1 border border-outline-variant rounded-lg px-3 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary"
                          type="text"
                          placeholder="Giá trị"
                          value={spec.value}
                          onChange={(e) =>
                              setSpecifications(prev =>
                                  prev.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s)
                              )
                          }
                      />
                      <button
                          type="button"
                          onClick={() => removeSpecification(i)}
                          className="text-text-light hover:text-error transition-colors p-2"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                ))}
              </div>
            </section>

            {/* Section 3: Product Options */}
            <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">tune</span>Tùy chọn sản phẩm
                </h3>
                <button type="button" onClick={addOptionType} className="flex items-center gap-1 text-secondary font-label-md text-label-md hover:underline">
                  <span className="material-symbols-outlined text-base">add_circle</span>Thêm thuộc tính
                </button>
              </div>
              {options.length === 0 && (
                  <p className="text-body-sm text-text-light text-center py-6 border border-dashed border-outline-variant rounded-lg">
                    Chưa có tùy chọn nào. Nhấp &quot;Thêm thuộc tính&quot; để bắt đầu.
                  </p>
              )}
              <div className="space-y-4">
                {options.map((option, oi) => (
                    <div key={oi} className="p-6 bg-surface-ivory rounded-md border border-outline-variant/10 flex gap-6 relative group">
                      <div className="w-1/3 space-y-2 shrink-0">
                        <label className="text-label-sm font-label-sm text-text-secondary">Loại tùy chọn</label>
                        <input className="w-full border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg bg-white px-3 py-2 font-body-md" type="text" placeholder="VD: Màu vỏ" value={option.name} onChange={(e) => updateOptionName(oi, e.target.value)} />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <label className="text-label-sm font-label-sm text-text-secondary">Giá trị</label>
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
                            <input type="text" className="bg-transparent border-none outline-none text-body-sm font-body-sm w-28 placeholder:text-text-light" placeholder="Thêm giá trị…"
                                   value={addValueInputs[oi] ?? ''}
                                   onChange={(e) => { const n = [...addValueInputs]; n[oi] = e.target.value; setAddValueInputs(n); }}
                                   onKeyDown={(e) => handleAddValueKeyDown(e, oi)}
                            />
                            <button type="button" onClick={() => commitAddValue(oi)} className="text-secondary hover:text-primary leading-none">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeOptionType(oi)} className="absolute -top-2.5 -right-2.5 bg-white text-error border border-error rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                ))}
              </div>
            </section>

            {/* Section 4: SKU Management */}
            <section className="bg-white p-8 rounded-lg border border-outline-variant/10 shadow-sm space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h3 className="text-h3 font-h3 text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">table_chart</span>Quản lý SKU
                  </h3>
                  <p className="text-body-sm font-body-sm text-text-secondary">
                    Quản lý mức tồn kho và giá cho từng biến thể.
                  </p>
                </div>
                <button
                    type="button"
                    onClick={regenerateSKUs}
                    className="flex items-center gap-1.5 bg-surface-container text-primary px-4 py-2 rounded-lg font-label-md text-label-md border border-primary/10 hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Tạo lại SKU
                </button>
              </div>

              {skus.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-outline-variant rounded-lg">
                    <span className="material-symbols-outlined text-4xl text-text-light block mb-2">inventory_2</span>
                    <p className="text-body-sm text-text-light">Chưa có SKU nào.</p>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant/10">
                        <th className="px-6 py-4 text-label-md font-label-md text-primary">Biến thể</th>
                        <th className="px-6 py-4 text-label-md font-label-md text-primary">Ảnh SKU</th>
                        <th className="px-6 py-4 text-label-md font-label-md text-primary">SKU</th>
                        <th className="px-6 py-4 text-label-md font-label-md text-primary">Giá ($)</th>
                        <th className="px-6 py-4 text-label-md font-label-md text-primary">Tồn kho</th>
                        <th className="px-6 py-4 text-label-md font-label-md text-primary">Hoạt động</th>
                        <th className="px-6 py-4 text-label-md font-label-md text-primary text-right">Hành động</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                      {skus.map((sku, idx) => {
                        const skuKey = sku.id?.toString() || String(idx);
                        const isEditing = editingId === skuKey;
                        return (
                            <tr key={skuKey} className="hover:bg-surface-ivory/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-label-md text-label-md">{sku.combination}</span>
                                  {isEditing ? (
                                      <input
                                          type="text"
                                          value={sku.label ?? ''}
                                          onChange={(e) => updateSkuRow(skuKey, 'label', e.target.value)}
                                          placeholder="Nhãn phụ (tùy chọn)"
                                          className="text-xs border border-outline-variant rounded px-2 py-0.5 w-40 focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                                      />
                                  ) : (
                                      sku.label && <span className="text-xs text-text-light">{sku.label}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <label className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-outline-variant bg-surface-container-low hover:border-secondary">
                                  {sku.imageUrl ? (
                                      <img src={sku.imageUrl} alt={sku.sku} className="h-full w-full object-cover" />
                                  ) : (
                                      <span className="material-symbols-outlined text-text-light">add_photo_alternate</span>
                                  )}
                                  <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(event) => handleSkuImageUpload(skuKey, event.target.files?.[0])}
                                  />
                                </label>
                              </td>
                              <td className="px-6 py-4">
                                <input
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-secondary font-semibold outline-none"
                                    type="text"
                                    value={sku.sku}
                                    onChange={(e) => updateSkuRow(skuKey, 'sku', e.target.value)}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                    className="w-24 bg-white border border-outline-variant rounded-lg px-3 py-2 text-right font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={sku.price}
                                    onChange={(e) => updateSkuRow(skuKey, 'price', e.target.value)}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                    className="w-20 bg-white border border-outline-variant rounded-lg px-3 py-2 text-center font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none"
                                    type="number"
                                    min={0}
                                    value={sku.stock}
                                    onChange={(e) => updateSkuRow(skuKey, 'stock', e.target.value)}
                                />
                              </td>
                              <td className="px-6 py-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                      type="checkbox"
                                      checked={sku.isActive ?? true}
                                      onChange={(e) => updateSkuRow(skuKey, 'isActive', e.target.checked)}
                                      className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                                </label>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingId(isEditing ? null : skuKey)}
                                    className={`inline-block transition-colors ${isEditing ? 'text-secondary' : 'text-text-light hover:text-primary'}`}
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    {isEditing ? 'check_circle' : 'edit'}
                                  </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeSkuRow(skuKey)}
                                    className="text-text-light hover:text-error inline-block transition-colors"
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

            <div className="flex justify-end gap-4 pb-8">
              <Link href="/admin/inventory" className="px-8 py-3 border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">Hủy</Link>
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-lg">
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </main>
      </div>
  );
}

