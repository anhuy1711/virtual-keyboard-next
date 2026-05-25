"use client";

import { useEffect, useMemo, useState } from "react";
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
  deleteCustomKeyboardBuildAPI,
  getCustomKeyboardCatalogAPI,
  getMyCustomKeyboardBuildsAPI,
  KeyboardBuild,
  quoteCustomKeyboardAPI,
  updateCustomKeyboardBuildAPI,
} from "@/app/services/customKeyboardService";
import "../custom-keyboard.css";

const money = (value?: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const parseKitOptions = (value?: string): Record<string, string> => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const findProductBySkuId = (products: CustomKeyboardProduct[] = [], skuId: number | null) =>
  products.find(
    (product) => product.skuId === skuId || product.skus?.some((sku) => sku.id === skuId)
  ) || null;

const findSkuById = (product: CustomKeyboardProduct | null, skuId: number | null) =>
  product?.skus?.find((sku) => sku.id === skuId) || null;

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

export default function CustomKeyboardCollectionPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CustomKeyboardCatalog | null>(null);
  const [builds, setBuilds] = useState<KeyboardBuild[]>([]);
  const [selectedBuildId, setSelectedBuildId] = useState<number | null>(null);
  const [buildName, setBuildName] = useState("");
  const [selectedKitSkuId, setSelectedKitSkuId] = useState<number | null>(null);
  const [selectedSwitchSkuId, setSelectedSwitchSkuId] = useState<number | null>(null);
  const [selectedKeycapSkuId, setSelectedKeycapSkuId] = useState<number | null>(null);
  const [kitOptions, setKitOptions] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<CustomKeyboardQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedBuild = useMemo(
    () => builds.find((build) => build.id === selectedBuildId) || null,
    [builds, selectedBuildId]
  );

  const selectedKit = useMemo(
    () => findProductBySkuId(catalog?.kits, selectedKitSkuId),
    [catalog, selectedKitSkuId]
  );

  const selectedSwitch = useMemo(
    () => findProductBySkuId(catalog?.switches, selectedSwitchSkuId),
    [catalog, selectedSwitchSkuId]
  );

  const selectedKeycap = useMemo(
    () => findProductBySkuId(catalog?.keycaps, selectedKeycapSkuId),
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
    const load = async () => {
      try {
        const [catalogData, buildData] = await Promise.all([
          getCustomKeyboardCatalogAPI(),
          getMyCustomKeyboardBuildsAPI(),
        ]);

        setCatalog(catalogData);
        setBuilds(buildData);
        setSelectedBuildId(buildData[0]?.id || null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Khong the tai collection");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!selectedBuild) {
      setBuildName("");
      setSelectedKitSkuId(null);
      setSelectedSwitchSkuId(null);
      setSelectedKeycapSkuId(null);
      setKitOptions({});
      return;
    }

    setBuildName(selectedBuild.name);
    setSelectedKitSkuId(selectedBuild.kitSkuId);
    setSelectedSwitchSkuId(selectedBuild.switchSkuId);
    setSelectedKeycapSkuId(selectedBuild.keycapSkuId);
    setKitOptions(parseKitOptions(selectedBuild.kitOptionsJson));
  }, [selectedBuild]);

  useEffect(() => {
    if (!selectedKit) return;

    setKitOptions((current) => {
      const next: Record<string, string> = {};
      selectedKit.optionGroups?.forEach((group) => {
        next[group.id] = current[group.id] || group.options[0]?.id || "";
      });
      return next;
    });
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

  const updateBuild = async () => {
    if (!selectedBuild || !payload) return;

    setSaving(true);
    try {
      const updated = await updateCustomKeyboardBuildAPI(selectedBuild.id, payload);
      setBuilds((current) =>
        current.map((build) => (build.id === selectedBuild.id ? updated : build))
      );
      toast.success("Da cap nhat cau hinh");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the cap nhat cau hinh");
    } finally {
      setSaving(false);
    }
  };

  const deleteBuild = async () => {
    if (!selectedBuild) return;

    const confirmed = window.confirm(`Xoa cau hinh "${selectedBuild.name}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteCustomKeyboardBuildAPI(selectedBuild.id);
      const nextBuilds = builds.filter((build) => build.id !== selectedBuild.id);
      setBuilds(nextBuilds);
      setSelectedBuildId(nextBuilds[0]?.id || null);
      toast.success("Da xoa cau hinh");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the xoa cau hinh");
    } finally {
      setDeleting(false);
    }
  };

  const addToCart = async () => {
    if (!payload) return;

    try {
      await addCustomKeyboardComboToCartAPI(payload);
      toast.success("Da them combo vao gio hang");
      router.push("/cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Khong the them combo vao gio hang");
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
            <p className="custom-builder-eyebrow">Collection</p>
            <h1>Bộ sưu tập</h1>
          </div>
          <div className="custom-builder-header-metrics">
            <button type="button" onClick={() => router.push("/custom-keyboard")}>
              Tạo mới
            </button>
          </div>
        </section>

        {loading && <div className="custom-builder-empty">Dang tai collection...</div>}

        {!loading && builds.length === 0 && (
          <div className="custom-builder-empty">
            Bạn chưa có sản phẩm nào trong bộ sưu tập.
          </div>
        )}

        {!loading && builds.length > 0 && !hasCatalog && (
          <div className="custom-builder-empty">
            Catalog hien khong du KIT, SWITCH va KEYCAP de chinh sua collection.
          </div>
        )}

        {!loading && builds.length > 0 && hasCatalog && catalog && selectedBuild && (
          <div className="collection-manager-layout">
            <aside className="collection-manager-list">
              <h2>Danh sách</h2>
              {builds.map((build) => (
                <button
                  type="button"
                  key={build.id}
                  className={build.id === selectedBuildId ? "active" : ""}
                  onClick={() => setSelectedBuildId(build.id)}
                >
                  <span>{build.name}</span>
                  <strong>{money(build.priceSnapshot)}</strong>
                </button>
              ))}
            </aside>

            <section className="collection-editor">
              <div className="collection-editor-heading">
                <div>
                  <h2>Chỉnh sửa</h2>
                  <p>ID #{selectedBuild.id}</p>
                </div>
                <div className="collection-editor-actions">
                  <button type="button" onClick={deleteBuild} disabled={deleting}>
                    Xoá
                  </button>
                  <button
                    type="button"
                    onClick={updateBuild}
                    disabled={!quote?.validation.valid || saving}
                  >
                    Lưu
                  </button>
                </div>
              </div>

              <div className="collection-editor-grid">
                <label className="build-name-field">
                  <span>Tên</span>
                  <input value={buildName} onChange={(event) => setBuildName(event.target.value)} />
                </label>

                <SelectField
                  label="Kit"
                  products={catalog.kits}
                  value={selectedKitSkuId}
                  onChange={setSelectedKitSkuId}
                />

                <SelectField
                  label="Switch"
                  products={catalog.switches}
                  value={selectedSwitchSkuId}
                  onChange={setSelectedSwitchSkuId}
                />

                <SelectField
                  label="Keycap"
                  products={catalog.keycaps}
                  value={selectedKeycapSkuId}
                  onChange={setSelectedKeycapSkuId}
                />
              </div>

              {!!selectedKit?.optionGroups?.length && (
                <div className="kit-option-grid collection-options">
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
              )}

              <div className="collection-quote">
                <SummaryRow
                  label="Kit"
                  value={selectedKit?.name || "-"}
                  price={quote?.kitPrice}
                  imageUrl={selectedKitSku?.imageUrl || selectedKit?.cover}
                />
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


                <button
                  type="button"
                  className="collection-cart-button"
                  onClick={addToCart}
                  disabled={!quote?.validation.valid}
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function SelectField({
  label,
  products,
  value,
  onChange,
}: {
  label: string;
  products: CustomKeyboardProduct[];
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <label className="kit-option-field">
      <span>{label}</span>
      <select
        value={
          products.find(
            (product) => product.skuId === value || product.skus?.some((sku) => sku.id === value)
          )?.skuId || ""
        }
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {products.map((product) => (
          <option key={product.skuId} value={product.skuId}>
            {product.name} - {money(product.price)}
          </option>
        ))}
      </select>
    </label>
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
