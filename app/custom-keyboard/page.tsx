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
  CustomKeyboardOptionGroup,
  CustomKeyboardProduct,
  CustomKeyboardQuote,
  CustomKeyboardSku,
  getCustomKeyboardCatalogAPI,
  quoteCustomKeyboardAPI,
  saveCustomKeyboardBuildAPI,
} from "@/app/services/customKeyboardService";
import "./custom-keyboard.css";

type BuilderStep = "kit" | "switch" | "keycap" | "summary";

const steps: { key: BuilderStep; label: string; title: string }[] = [
  { key: "kit", label: "Kit", title: "Chọn kit" },
  { key: "switch", label: "Switch", title: "Chọn switch" },
  { key: "keycap", label: "Keycap", title: "Chọn keycap" },
  { key: "summary", label: "Tổng hợp", title: "Hoàn thiện custom" },
];

const money = (value?: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const findSkuBySelectedOptions = (
  product: CustomKeyboardProduct | null,
  selectedOptions: Record<string, string>
): CustomKeyboardSku | null => {
  if (!product?.skus || product.skus.length === 0) return null;

  const selectedValueIds = Object.values(selectedOptions)
    .filter(Boolean)
    .map((value) => Number(value))
    .sort((a, b) => a - b);

  if (selectedValueIds.length === 0) {
    return product.skus[0];
  }

  const exactMatch = product.skus.find((sku) => {
      const skuValueIds = [...(sku.optionValueIds || [])].sort((a, b) => a - b);
      return (
        skuValueIds.length === selectedValueIds.length &&
        skuValueIds.every((id, index) => id === selectedValueIds[index])
      );
    });

  if (exactMatch) return exactMatch;

  return (
    product.skus.find((sku) => {
      const skuValueIds = sku.optionValueIds || [];
      return selectedValueIds.every((id) => skuValueIds.includes(id));
    }) || null
  );
};

const findSkuById = (product: CustomKeyboardProduct | null, skuId: number | null) =>
  product?.skus?.find((sku) => sku.id === skuId) || null;

const findProductBySkuId = (products: CustomKeyboardProduct[] = [], skuId: number | null) =>
  products.find(
    (item) => item.skuId === skuId || item.skus?.some((sku) => sku.id === skuId)
  ) || null;

const productImageForSku = (
  product: CustomKeyboardProduct | null,
  sku: CustomKeyboardSku | null
) => {
  if (!product) return "";
  const productSkuImage =
    product.skus?.find((item) => item.id === sku?.id)?.imageUrl ||
    product.skus?.find((item) => item.id === product.skuId)?.imageUrl ||
    product.skus?.[0]?.imageUrl;

  return sku?.imageUrl || productSkuImage || product.cover || product.imageUrl || "";
};

const defaultOptionsFor = (product: CustomKeyboardProduct | null) => {
  const defaults: Record<string, string> = {};
  product?.optionGroups?.forEach((group) => {
    defaults[group.id] = group.options[0]?.id || "";
  });
  return defaults;
};

const optionSummary = (
  product: CustomKeyboardProduct | null,
  selectedOptions: Record<string, string>
) => {
  if (!product?.optionGroups?.length) return "Không có option";

  const values = product.optionGroups
    .map((group) => {
      const option = group.options.find((item) => item.id === selectedOptions[group.id]);
      return option ? `${group.name}: ${option.name}` : "";
    })
    .filter(Boolean);

  return values.length > 0 ? values.join(" • ") : "Chưa chọn option";
};

export default function CustomKeyboardPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CustomKeyboardCatalog | null>(null);
  const [activeStep, setActiveStep] = useState<BuilderStep>("kit");
  const [selectedKitSkuId, setSelectedKitSkuId] = useState<number | null>(null);
  const [selectedSwitchSkuId, setSelectedSwitchSkuId] = useState<number | null>(null);
  const [selectedKeycapSkuId, setSelectedKeycapSkuId] = useState<number | null>(null);
  const [kitOptions, setKitOptions] = useState<Record<string, string>>({});
  const [switchOptions, setSwitchOptions] = useState<Record<string, string>>({});
  const [keycapOptions, setKeycapOptions] = useState<Record<string, string>>({});
  const [search, setSearch] = useState<Record<BuilderStep, string>>({
    kit: "",
    switch: "",
    keycap: "",
    summary: "",
  });
  const [buildName, setBuildName] = useState("Bàn phím tùy chỉnh của tôi");
  const [quote, setQuote] = useState<CustomKeyboardQuote | null>(null);
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
    setKitOptions(defaultOptionsFor(selectedKit));
  }, [selectedKit]);

  useEffect(() => {
    setSwitchOptions(defaultOptionsFor(selectedSwitch));
  }, [selectedSwitch]);

  useEffect(() => {
    setKeycapOptions(defaultOptionsFor(selectedKeycap));
  }, [selectedKeycap]);

  useEffect(() => {
    const matchingSku = findSkuBySelectedOptions(selectedKit, kitOptions);
    if (matchingSku && matchingSku.id !== selectedKitSkuId) {
      setSelectedKitSkuId(matchingSku.id);
    }
  }, [selectedKit, kitOptions, selectedKitSkuId]);

  useEffect(() => {
    const matchingSku = findSkuBySelectedOptions(selectedSwitch, switchOptions);
    if (matchingSku && matchingSku.id !== selectedSwitchSkuId) {
      setSelectedSwitchSkuId(matchingSku.id);
    }
  }, [selectedSwitch, switchOptions, selectedSwitchSkuId]);

  useEffect(() => {
    const matchingSku = findSkuBySelectedOptions(selectedKeycap, keycapOptions);
    if (matchingSku && matchingSku.id !== selectedKeycapSkuId) {
      setSelectedKeycapSkuId(matchingSku.id);
    }
  }, [selectedKeycap, keycapOptions, selectedKeycapSkuId]);

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
        if (!cancelled) setQuote(data);
      } catch {
        if (!cancelled) setQuote(null);
      }
    };

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [payload]);

  const saveBuild = async () => {
    if (!payload) return;
    setSaving(true);
    try {
      await saveCustomKeyboardBuildAPI(payload);
      toast.success("Đã lưu cấu hình vào bộ sưu tập");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Vui lòng đăng nhập để lưu cấu hình này");
    } finally {
      setSaving(false);
    }
  };

  const addToCart = async () => {
    if (!payload) return;
    try {
      await addCustomKeyboardComboToCartAPI(payload);
      toast.success("Đã thêm combo vào giỏ hàng");
      router.push("/cart");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Vui lòng đăng nhập để thêm combo vào giỏ hàng");
    }
  };

  const hasCatalog =
    !!catalog && catalog.kits.length > 0 && catalog.switches.length > 0 && catalog.keycaps.length > 0;

  const goNext = () => {
    const index = steps.findIndex((step) => step.key === activeStep);
    const next = steps[Math.min(index + 1, steps.length - 1)];
    setActiveStep(next.key);
  };

  const goBack = () => {
    const index = steps.findIndex((step) => step.key === activeStep);
    const previous = steps[Math.max(index - 1, 0)];
    setActiveStep(previous.key);
  };

  const updateSearch = (step: BuilderStep, value: string) => {
    setSearch((current) => ({ ...current, [step]: value }));
  };

  const renderStep = () => {
    if (!catalog) return null;

    if (activeStep === "summary") {
      return (
        <SummaryStep
          buildName={buildName}
          setBuildName={setBuildName}
          selectedKit={selectedKit}
          selectedSwitch={selectedSwitch}
          selectedKeycap={selectedKeycap}
          selectedKitSku={selectedKitSku}
          selectedSwitchSku={selectedSwitchSku}
          selectedKeycapSku={selectedKeycapSku}
          kitOptions={kitOptions}
          switchOptions={switchOptions}
          keycapOptions={keycapOptions}
          quote={quote}
          saving={saving}
          onBack={goBack}
          onSave={saveBuild}
          onAddToCart={addToCart}
        />
      );
    }

    if (activeStep === "kit") {
      return (
        <ProductStep
          step="kit"
          title="Chọn kit"
          products={catalog.kits}
          selectedProduct={selectedKit}
          selectedSku={selectedKitSku}
          selectedSkuId={selectedKitSkuId}
          selectedOptions={kitOptions}
          searchValue={search.kit}
          onSearchChange={(value) => updateSearch("kit", value)}
          onProductSelect={setSelectedKitSkuId}
          onOptionChange={setKitOptions}
          onNext={goNext}
          onBack={goBack}
          canGoBack={false}
          price={quote?.kitPrice}
        />
      );
    }

    if (activeStep === "switch") {
      return (
        <ProductStep
          step="switch"
          title="Chọn switch"
          description="Chọn switch cho bộ custom. Số lượng switch được tính theo kit đã chọn."
          products={catalog.switches}
          selectedProduct={selectedSwitch}
          selectedSku={selectedSwitchSku}
          selectedSkuId={selectedSwitchSkuId}
          selectedOptions={switchOptions}
          searchValue={search.switch}
          onSearchChange={(value) => updateSearch("switch", value)}
          onProductSelect={setSelectedSwitchSkuId}
          onOptionChange={setSwitchOptions}
          onNext={goNext}
          onBack={goBack}
          canGoBack
          price={quote?.switchTotalPrice}
          quantity={quote?.switchQuantity}
        />
      );
    }

    return (
      <ProductStep
        step="keycap"
        title="Chọn keycap"
        description="Chọn bộ keycap và option màu sắc nếu sản phẩm có nhiều biến thể."
        products={catalog.keycaps}
        selectedProduct={selectedKeycap}
        selectedSku={selectedKeycapSku}
        selectedSkuId={selectedKeycapSkuId}
        selectedOptions={keycapOptions}
        searchValue={search.keycap}
        onSearchChange={(value) => updateSearch("keycap", value)}
        onProductSelect={setSelectedKeycapSkuId}
        onOptionChange={setKeycapOptions}
        onNext={goNext}
        onBack={goBack}
        canGoBack
        price={quote?.keycapPrice}
      />
    );
  };

  return (
    <>
      <TopNav />
      <main className="custom-builder-page">
        <section className="custom-builder-header">
          <div>
            <p className="custom-builder-eyebrow">Custom keyboard</p>
            <h1>Tùy chỉnh bàn phím theo kit, switch và keycap</h1>
          </div>
        </section>

        {loading && <div className="custom-builder-empty">Đang tải bộ dựng bàn phím...</div>}

        {!loading && !hasCatalog && (
          <div className="custom-builder-empty">
            Cần có ít nhất 1 sản phẩm loại KIT, 1 SWITCH và 1 KEYCAP có SKU đang hoạt động để tạo combo.
          </div>
        )}

        {!loading && hasCatalog && (
          <section className="custom-builder-shell">
            <StepNav activeStep={activeStep} onSelect={setActiveStep} />
            {renderStep()}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function StepNav({
  activeStep,
  onSelect,
}: {
  activeStep: BuilderStep;
  onSelect: (step: BuilderStep) => void;
}) {
  const activeIndex = steps.findIndex((step) => step.key === activeStep);

  return (
    <div className="builder-step-nav">
      {steps.map((step, index) => (
        <button
          type="button"
          key={step.key}
          className={index === activeIndex ? "active" : ""}
          onClick={() => onSelect(step.key)}
        >
          <span>{index + 1}</span>
          {step.label}
        </button>
      ))}
    </div>
  );
}

function ProductStep({
  step,
  title,
  description = "",
  products,
  selectedProduct,
  selectedSku,
  selectedSkuId,
  selectedOptions,
  searchValue,
  onSearchChange,
  onProductSelect,
  onOptionChange,
  onNext,
  onBack,
  canGoBack,
  price,
  quantity,
}: {
  step: BuilderStep;
  title: string;
  description?: string;
  products: CustomKeyboardProduct[];
  selectedProduct: CustomKeyboardProduct | null;
  selectedSku: CustomKeyboardSku | null;
  selectedSkuId: number | null;
  selectedOptions: Record<string, string>;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onProductSelect: (skuId: number) => void;
  onOptionChange: (options: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  price?: number;
  quantity?: number;
}) {
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    if (!normalizedSearch) return true;
    return `${product.name} ${product.summary || ""}`.toLowerCase().includes(normalizedSearch);
  });
  const displaySku = findSkuBySelectedOptions(selectedProduct, selectedOptions) || selectedSku;
  const selectedProductImage = productImageForSku(selectedProduct, displaySku);

  return (
    <div className="builder-step-layout">
      <aside className="builder-preview-panel">
        <div className="builder-preview-image">
          {selectedProductImage ? (
            <img
              key={displaySku?.id || selectedProduct?.skuId || selectedProductImage}
              src={selectedProductImage}
              alt={selectedProduct?.name || title}
            />
          ) : (
            <span>{step.toUpperCase()}</span>
          )}
        </div>
        <div className="builder-preview-details">
          <span>{title}</span>
          <h2>{selectedProduct?.name || "Chưa chọn sản phẩm"}</h2>
          <p>{optionSummary(selectedProduct, selectedOptions)}</p>
          <strong>{money(price ?? displaySku?.price ?? selectedProduct?.price)}</strong>
          {quantity && <em>Số lượng switch: {quantity}</em>}
        </div>
      </aside>

      <section className="builder-choice-panel">
        <div className="builder-choice-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm sản phẩm"
            aria-label="Tìm sản phẩm"
          />
        </div>

        {selectedProduct?.optionGroups && selectedProduct.optionGroups.length > 0 && (
          <OptionFields
            groups={selectedProduct.optionGroups}
            selectedOptions={selectedOptions}
            onChange={onOptionChange}
          />
        )}

        <div className="builder-choice-scroll">
          <div className="builder-product-list">
            {filteredProducts.map((product) => {
              const selected =
                selectedSkuId === product.skuId ||
                product.skus?.some((sku) => sku.id === selectedSkuId);
              const cardSku = selected ? displaySku : findSkuById(product, product.skuId);
              const cardImage = productImageForSku(product, cardSku);

              return (
                <button
                  type="button"
                  key={product.skuId}
                  className={`builder-product-card ${selected ? "selected" : ""}`}
                  onClick={() => onProductSelect(product.skuId)}
                >
                  <div className="builder-product-image">
                    {cardImage ? (
                      <img
                        key={`${product.skuId}-${cardSku?.id || "default"}`}
                        src={cardImage}
                        alt={product.name}
                      />
                    ) : (
                      <span>KB</span>
                    )}
                  </div>
                  <div className="builder-product-info">
                    <h3>{product.name}</h3>
                    <p>{product.summary || "Sẵn sàng để tạo combo tùy chỉnh"}</p>
                    <div className="builder-product-meta">
                      <span>{money(product.price)}</span>
                      <span>Tồn kho {product.stock}</span>
                      {product.requiredSwitchCount && <span>{product.requiredSwitchCount} switch</span>}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="builder-no-results">Không tìm thấy sản phẩm phù hợp.</div>
            )}
          </div>
        </div>

        <div className="builder-step-actions">
          <button type="button" className="secondary" onClick={onBack} disabled={!canGoBack}>
            Quay lại
          </button>
          <button type="button" onClick={onNext} disabled={!selectedSkuId}>
            Bước tiếp theo
          </button>
        </div>
      </section>
    </div>
  );
}

function OptionFields({
  groups,
  selectedOptions,
  onChange,
}: {
  groups: CustomKeyboardOptionGroup[];
  selectedOptions: Record<string, string>;
  onChange: (options: Record<string, string>) => void;
}) {
  return (
    <div className="builder-option-panel">
      <h3>Option của sản phẩm</h3>
      <div className="kit-option-grid">
        {groups.map((group) => (
          <label key={group.id} className="kit-option-field">
            <span>{group.name}</span>
            <select
              value={selectedOptions[group.id] || ""}
              onChange={(event) =>
                onChange({
                  ...selectedOptions,
                  [group.id]: event.target.value,
                })
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
    </div>
  );
}

function SummaryStep({
  buildName,
  setBuildName,
  selectedKit,
  selectedSwitch,
  selectedKeycap,
  selectedKitSku,
  selectedSwitchSku,
  selectedKeycapSku,
  kitOptions,
  switchOptions,
  keycapOptions,
  quote,
  saving,
  onBack,
  onSave,
  onAddToCart,
}: {
  buildName: string;
  setBuildName: (value: string) => void;
  selectedKit: CustomKeyboardProduct | null;
  selectedSwitch: CustomKeyboardProduct | null;
  selectedKeycap: CustomKeyboardProduct | null;
  selectedKitSku: CustomKeyboardSku | null;
  selectedSwitchSku: CustomKeyboardSku | null;
  selectedKeycapSku: CustomKeyboardSku | null;
  kitOptions: Record<string, string>;
  switchOptions: Record<string, string>;
  keycapOptions: Record<string, string>;
  quote: CustomKeyboardQuote | null;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
  onAddToCart: () => void;
}) {
  const isValid = !!quote?.validation.valid;
  const displayKitSku = findSkuBySelectedOptions(selectedKit, kitOptions) || selectedKitSku;
  const displaySwitchSku =
    findSkuBySelectedOptions(selectedSwitch, switchOptions) || selectedSwitchSku;
  const displayKeycapSku =
    findSkuBySelectedOptions(selectedKeycap, keycapOptions) || selectedKeycapSku;

  return (
    <div className="builder-summary-step">
      <section className="builder-summary-panel">
        <div className="builder-summary-heading">
          <div>
            <h2>Tổng hợp bộ custom</h2>
            <p>Kiểm tra lại sản phẩm, option và giá trước khi hoàn tất.</p>
          </div>
          <label className="build-name-field">
            <span>Tên cấu hình</span>
            <input value={buildName} onChange={(event) => setBuildName(event.target.value)} />
          </label>
        </div>

        <div className="summary-product-grid">
          <SummaryCard
            label="Kit"
            product={selectedKit}
            sku={displayKitSku}
            options={optionSummary(selectedKit, kitOptions)}
            price={quote?.kitPrice}
          />
          <SummaryCard
            label="Switch"
            product={selectedSwitch}
            sku={displaySwitchSku}
            options={optionSummary(selectedSwitch, switchOptions)}
            price={quote?.switchTotalPrice}
            note={`Số lượng: ${quote?.switchQuantity || 0}`}
          />
          <SummaryCard
            label="Keycap"
            product={selectedKeycap}
            sku={displayKeycapSku}
            options={optionSummary(selectedKeycap, keycapOptions)}
            price={quote?.keycapPrice}
          />
        </div>

        <div className="summary-price-breakdown">
          <SummaryLine label="Giá kit" value={quote?.kitPrice} />
          <SummaryLine label="Option kit" value={quote?.kitOptionPrice} />
          <SummaryLine label="Switch" value={quote?.switchTotalPrice} />
          <SummaryLine label="Keycap" value={quote?.keycapPrice} />
        </div>

        {quote && !quote.validation.valid && (
          <div className="validation-error">{quote.validation.errors.join(" ")}</div>
        )}

        <div className="summary-total">
          <span>Tổng tiền</span>
          <strong>{money(quote?.totalPrice)}</strong>
        </div>

        <div className="summary-actions">
          <button type="button" className="secondary" onClick={onBack}>
            Quay lại
          </button>
          <button type="button" onClick={onSave} disabled={!isValid || saving}>
            Thêm vào bộ sưu tập
          </button>
          <button type="button" onClick={onAddToCart} disabled={!isValid}>
            Thêm giỏ hàng
          </button>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  product,
  sku,
  options,
  price,
  note,
}: {
  label: string;
  product: CustomKeyboardProduct | null;
  sku: CustomKeyboardSku | null;
  options: string;
  price?: number;
  note?: string;
}) {
  const imageUrl = productImageForSku(product, sku);

  return (
    <article className="summary-product-card">
      <div className="summary-product-image">
        {imageUrl ? (
          <img key={sku?.id || imageUrl} src={imageUrl} alt={product?.name || label} />
        ) : (
          <span>{label}</span>
        )}
      </div>
      <div>
        <span>{label}</span>
        <h3>{product?.name || "-"}</h3>
        <p>{options}</p>
        {note && <em>{note}</em>}
        <strong>{money(price ?? sku?.price ?? product?.price)}</strong>
      </div>
    </article>
  );
}

function SummaryLine({ label, value }: { label: string; value?: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{money(value)}</strong>
    </div>
  );
}
