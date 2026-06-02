"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import {
  addCustomKeyboardComboToCartAPI,
  CustomKeyboardBuildRequest,
  CustomKeyboardCatalog,
  CustomKeyboardProduct,
  CustomKeyboardQuote,
  CustomKeyboardSku,
  getCustomKeyboardCatalogAPI,
  getMyCustomKeyboardBuildsAPI,
  KeyboardBuild,
  quoteCustomKeyboardAPI,
  saveCustomKeyboardBuildAPI,
} from "@/app/services/customKeyboardService";
import "./custom-keyboard.css";

const money = (value?: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const findSkuBySelectedOptions = (
  product: CustomKeyboardProduct | null,
  kitOptions: Record<string, string>
): CustomKeyboardSku | null => {
  if (!product?.skus || product.skus.length === 0) return null;

  const selectedValueIds = Object.values(kitOptions)
    .filter(Boolean)
    .map((value) => Number(value))
    .sort((a, b) => a - b);

  if (selectedValueIds.length === 0) {
    return product.skus[0];
  }

  return (
    product.skus.find((sku) => {
      const skuValueIds = [...(sku.optionValueIds || [])].sort((a, b) => a - b);
      return (
        skuValueIds.length === selectedValueIds.length &&
        skuValueIds.every((id, index) => id === selectedValueIds[index])
      );
    }) || null
  );
};

const findSkuById = (product: CustomKeyboardProduct | null, skuId: number | null) =>
  product?.skus?.find((sku) => sku.id === skuId) || null;

export default function CustomKeyboardPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CustomKeyboardCatalog | null>(null);
  const [selectedKitSkuId, setSelectedKitSkuId] = useState<number | null>(null);
  const [selectedSwitchSkuId, setSelectedSwitchSkuId] = useState<number | null>(null);
  const [selectedKeycapSkuId, setSelectedKeycapSkuId] = useState<number | null>(null);
  const [kitOptions, setKitOptions] = useState<Record<string, string>>({});
  const [buildName, setBuildName] = useState("Bàn phím tùy chỉnh của tôi");
  const [quote, setQuote] = useState<CustomKeyboardQuote | null>(null);
  const [builds, setBuilds] = useState<KeyboardBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCustomKeyboardCatalogAPI();
        setCatalog(data);
        setSelectedKitSkuId(data.kits[0]?.skuId || null);
        setSelectedSwitchSkuId(data.switches[0]?.skuId || null);
        setSelectedKeycapSkuId(data.keycaps[0]?.skuId || null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Không thể tải danh mục tùy chỉnh");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectedKit = useMemo(
    () =>
      catalog?.kits.find(
        (item) =>
          item.skuId === selectedKitSkuId ||
          item.skus?.some((sku) => sku.id === selectedKitSkuId)
      ) || null,
    [catalog, selectedKitSkuId]
  );

  const selectedSwitch = useMemo(
    () =>
      catalog?.switches.find(
        (item) =>
          item.skuId === selectedSwitchSkuId ||
          item.skus?.some((sku) => sku.id === selectedSwitchSkuId)
      ) || null,
    [catalog, selectedSwitchSkuId]
  );

  const selectedKeycap = useMemo(
    () =>
      catalog?.keycaps.find(
        (item) =>
          item.skuId === selectedKeycapSkuId ||
          item.skus?.some((sku) => sku.id === selectedKeycapSkuId)
      ) || null,
    [catalog, selectedKeycapSkuId]
  );

  const selectedKitSku = useMemo(
    () => findSkuById(selectedKit, selectedKitSkuId),
    [selectedKit, selectedKitSkuId]
  );

  const selectedSwitchSku = useMemo(
    () => findSkuById(selectedSwitch, selectedSwitchSkuId),
    [selectedSwitch, selectedSwitchSkuId]
  );

  const selectedKeycapSku = useMemo(
    () => findSkuById(selectedKeycap, selectedKeycapSkuId),
    [selectedKeycap, selectedKeycapSkuId]
  );

  useEffect(() => {
    if (!selectedKit) {
      setKitOptions({});
      return;
    }

    const defaults: Record<string, string> = {};
    selectedKit.optionGroups?.forEach((group) => {
      defaults[group.id] = group.options[0]?.id || "";
    });
    setKitOptions(defaults);
  }, [selectedKit]);

  useEffect(() => {
    if (!selectedKit) return;
    const matchingSku = findSkuBySelectedOptions(selectedKit, kitOptions);
    if (matchingSku && matchingSku.id !== selectedKitSkuId) {
      setSelectedKitSkuId(matchingSku.id);
    }
  }, [selectedKit, kitOptions, selectedKitSkuId]);

  const payload = useMemo<CustomKeyboardBuildRequest | null>(() => {
    if (!selectedKitSkuId || !selectedSwitchSkuId || !selectedKeycapSkuId) {
      return null;
    }

    return {
      name: buildName,
      kitSkuId: selectedKitSkuId,
      switchSkuId: selectedSwitchSkuId,
      keycapSkuId: selectedKeycapSkuId,
      kitOptions,
      assemblyFee: 0,
    };
  }, [buildName, selectedKitSkuId, selectedSwitchSkuId, selectedKeycapSkuId, kitOptions]);

  useEffect(() => {
    if (!payload) {
      setQuote(null);
      return;
    }

    let cancelled = false;

    const loadQuote = async () => {
      try {
        const data = await quoteCustomKeyboardAPI(payload);
        if (!cancelled) {
          setQuote(data);
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
        }
      }
    };

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [payload]);

  const loadBuilds = async () => {
    try {
      const data = await getMyCustomKeyboardBuildsAPI();
      setBuilds(data);
    } catch {
      setBuilds([]);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, []);

  const saveBuild = async () => {
    if (!payload) return;
    setSaving(true);
    try {
      await saveCustomKeyboardBuildAPI(payload);
      toast.success("Đã lưu cấu hình vào bộ sưu tập");
      await loadBuilds();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Vui lòng đăng nhập để lưu cấu hình này");
    } finally {
      setSaving(false);
    }
  };

  const addToCart = async (goCheckout = false) => {
    if (!payload) return;
    try {
      await addCustomKeyboardComboToCartAPI(payload);
      toast.success("Đã thêm combo vào giỏ hàng");
      router.push(goCheckout ? "/checkout" : "/cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Vui lòng đăng nhập để thêm combo vào giỏ hàng");
    }
  };

  const hasCatalog =
    !!catalog && catalog.kits.length > 0 && catalog.switches.length > 0 && catalog.keycaps.length > 0;

  return (
    <>
      <TopNav />
      <main className="custom-builder-page">
        <section className="custom-builder-header">
          <div>
            <p className="custom-builder-eyebrow">Bộ dựng bàn phím</p>
            <h1>Tùy chỉnh bàn phím theo kit, switch và keycap</h1>
            <p>
              Chọn kit làm gốc, cấu hình tùy chọn trong kit, sau đó chọn switch và keycap phù hợp.
            </p>
          </div>
          <div className="custom-builder-header-metrics">
            <span>{catalog?.kits.length || 0} kit</span>
            <span>{catalog?.switches.length || 0} switch</span>
            <span>{catalog?.keycaps.length || 0} keycap</span>
          </div>
        </section>

        {loading && <div className="custom-builder-empty">Đang tải bộ dựng bàn phím...</div>}

        {!loading && !hasCatalog && (
          <div className="custom-builder-empty">
            Cần có ít nhất 1 sản phẩm loại KIT, 1 SWITCH và 1 KEYCAP có SKU đang hoạt động để tạo combo.
          </div>
        )}

        {!loading && hasCatalog && catalog && (
          <div className="custom-builder-layout">
            <div className="custom-builder-main">
              <BuilderSection
                title="1. Chọn kit"
                subtitle="Kit quyết định layout, tùy chọn và số lượng switch cần dùng."
                products={catalog.kits}
                selectedSkuId={selectedKitSkuId}
                onSelect={setSelectedKitSkuId}
              />

              {selectedKit?.optionGroups && (
                <section className="builder-section">
                  <div className="builder-section-heading">
                    <div>
                      <h2>2. Cấu hình kit</h2>
                      <p>Tùy chọn hiển thị theo kit đang chọn.</p>
                    </div>
                  </div>

                  <div className="kit-option-grid">
                    {selectedKit.optionGroups.map((group) => (
                      <label key={group.id} className="kit-option-field">
                        <span>{group.name}</span>
                        <select
                          value={kitOptions[group.id] || ""}
                          onChange={(event) =>
                            setKitOptions((current) => ({
                              ...current,
                              [group.id]: event.target.value,
                            }))
                          }
                        >
                          {group.options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name} {option.priceDelta > 0 ? `+ ${money(option.priceDelta)}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              <BuilderSection
                title="3. Chọn switch"
                subtitle="Số lượng switch được tính tự động theo kit."
                products={catalog.switches}
                selectedSkuId={selectedSwitchSkuId}
                onSelect={setSelectedSwitchSkuId}
              />

              <BuilderSection
                title="4. Chọn keycap"
                products={catalog.keycaps}
                selectedSkuId={selectedKeycapSkuId}
                onSelect={setSelectedKeycapSkuId}
              />
            </div>

            <aside className="custom-summary">
              <label className="build-name-field">
                <span>Tên cấu hình</span>
                <input value={buildName} onChange={(event) => setBuildName(event.target.value)} />
              </label>

              <SummaryRow
                label="Kit"
                value={selectedKit?.name || "-"}
                price={quote?.kitPrice}
                imageUrl={selectedKitSku?.imageUrl || selectedKit?.cover}
              />
              <SummaryRow label="Tùy chọn kit" value="Các tùy chọn đã chọn" price={quote?.kitOptionPrice} />
              <SummaryRow
                label="Switch"
                value={`${selectedSwitch?.name || "-"} x ${quote?.switchQuantity || 0}`}
                price={quote?.switchTotalPrice}
                imageUrl={selectedSwitchSku?.imageUrl || selectedSwitch?.cover}
              />
              <SummaryRow
                label="Keycap"
                value={selectedKeycap?.name || "-"}
                price={quote?.keycapPrice}
                imageUrl={selectedKeycapSku?.imageUrl || selectedKeycap?.cover}
              />

              <div className="summary-total">
                <span>Tổng tiền</span>
                <strong>{money(quote?.totalPrice)}</strong>
              </div>


              <div className="summary-actions">
                <button type="button" onClick={saveBuild} disabled={!quote?.validation.valid || saving}>
                  Lưu bộ sưu tập
                </button>
                <button type="button" onClick={() => addToCart(false)} disabled={!quote?.validation.valid}>
                  Thêm combo vào giỏ
                </button>
                <button type="button" onClick={() => addToCart(true)} disabled={!quote?.validation.valid}>
                  Mua ngay
                </button>
              </div>


            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function BuilderSection({
  title,
  subtitle,
  products,
  selectedSkuId,
  onSelect,
}: {
  title: string;
  subtitle: string;
  products: CustomKeyboardProduct[];
  selectedSkuId: number | null;
  onSelect: (skuId: number) => void;
}) {
  return (
    <section className="builder-section">
      <div className="builder-section-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="builder-product-grid">
        {products.map((product) => (
          <button
            type="button"
            key={product.skuId}
            className={`builder-product-card ${
              selectedSkuId === product.skuId ||
              product.skus?.some((sku) => sku.id === selectedSkuId)
                ? "selected"
                : ""
            }`}
            onClick={() => onSelect(product.skuId)}
          >
            <div className="builder-product-image">
              {product.cover ? <img src={product.cover} alt={product.name} /> : <span>KB</span>}
            </div>
            <div>
              <h3>{product.name}</h3>
              <p>{product.summary || "Sẵn sàng để tạo combo tùy chỉnh"}</p>
              <div className="builder-product-meta">
                <span>{money(product.price)}</span>
                <span>Tồn kho {product.stock}</span>
                {product.requiredSwitchCount && <span>{product.requiredSwitchCount} switch</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  price,
  imageUrl,
}: {
  label: string;
  value: string;
  price?: number;
  imageUrl?: string;
}) {
  return (
    <div className="summary-row">
      <div className="summary-row-content">
        {imageUrl && <img src={imageUrl} alt={value} />}
        <div>
          <span>{label}</span>
          <p>{value}</p>
        </div>
      </div>
      <strong>{money(price)}</strong>
    </div>
  );
}
