"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProductDetailAPI, ProductDetailResponse } from "@/app/services/productService";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import {toast} from "react-toastify";

// Mock data for testing UI
const MOCK_PRODUCT: ProductDetailResponse = {
  id: 1,
  name: "The Artisan VII",
  description:
    "The Artisan VII represents the pinnacle of our design philosophy. Crafted from a single block of aerospace-grade aluminum, it features a unique internal dampening system that produces a resonant, creamy acoustic profile—affectionately known in the community as 'the thock'. Experience premium build quality with hot-swap PCB and gasket mounting system.",
  summary: "Limited Edition Release",
  cover:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDG_ybH6GhZsjF_dmJiJZlDwzF78-UQwQn5AiGkfH094cL1C923fgs6dVcdbI28Zup4Odu93UNa4NxTSFezF_9UcZ8zerolW947YZlaUNRMQ34do3FhstizT6FB_Cs3Dw9CbT08KfCyVLCcFAALOhiuDVcyRAhgd3ROz0rmYPQDF_-c5gzb_MmVMcAqeleqDJGw_pgI3tI-_Q42VlAcuGQhnmNYqzEks6UwF0W8XUz8NCRLfY5sLYHNUgOY8llXGlF8Ol2avnMTZ6Y",
  categoryId: 1,
  specifications: [],
  skus: [
    {
      id: 1,
      productId: 1,
      sku: "ART7-NAVY-TAN-001",
      price: 489.00,
      quantity: 5,
      isActive: true,
      optionValueIds: [0, 0],
    },
    {
      id: 2,
      productId: 1,
      sku: "ART7-NAVY-HOLY-001",
      price: 499.00,
      quantity: 0,
      isActive: true,
      optionValueIds: [0, 1],
    },
    {
      id: 3,
      productId: 1,
      sku: "ART7-WHITE-TAN-001",
      price: 509.00,
      quantity: 8,
      isActive: true,
      optionValueIds: [1, 0],
    },
    {
      id: 4,
      productId: 1,
      sku: "ART7-WHITE-HOLY-001",
      price: 519.00,
      quantity: 3,
      isActive: true,
      optionValueIds: [1, 1],
    },
    {
      id: 5,
      productId: 1,
      sku: "ART7-BLACK-TAN-001",
      price: 479.00,
      quantity: 10,
      isActive: true,
      optionValueIds: [2, 0],
    },
    {
      id: 6,
      productId: 1,
      sku: "ART7-BLACK-HOLY-001",
      price: 489.00,
      quantity: 0,
      isActive: true,
      optionValueIds: [2, 1],
    },
  ],
  options: [
    {
      id: 1,
      name: "Color",
      values: [
        { id: 1, value: "Midnight Navy" },
        { id: 2, value: "Arctic White" },
        { id: 3, value: "Obsidian Black" },
      ],
    },
    {
      id: 2,
      name: "Switch Type",
      values: [
        { id: 4, value: "Tangerine V2" },
        { id: 5, value: "Holy Panda" },
      ],
    },
  ],
};

/**
 * Get first available value for each option
 */
function getInitialSelectedOptions(options?: ProductDetailResponse['options']): Record<number, number> {
  if (!options || options.length === 0) return {};
  
  const initial: Record<number, number> = {};
  options.forEach(option => {
    if (option.values && option.values.length > 0) {
      initial[option.id] = option.values[0].id;
    }
  });
  
  return initial;
}

// ── Helper: Find SKU matching selected option values ──
function findMatchingSKU(
  selectedOptions: Record<number, number>,
  skus: ProductDetailResponse['skus'],
  options: ProductDetailResponse['options']
): ProductDetailResponse['skus'][number] | null {
  if (!options || options.length === 0) return null;
  
  // Build optionValueIds based on selectedOptions
  // Note: Backend returns optionValueIds as IDs, not indices
  const optionValueIds = options.map((opt) => {
    const selectedValueId = selectedOptions[opt.id];
    if (!selectedValueId) return -1;
    return selectedValueId; // Use the ID directly
  });

  // Find SKU with matching optionValueIds
  return skus.find((sku) =>
    JSON.stringify(sku.optionValueIds) === JSON.stringify(optionValueIds)
  ) || null;
}

// ── Helper: Check if all options are selected ──
function areAllOptionsSelected(selectedOptions: Record<number, number>, options: ProductDetailResponse['options']): boolean {
  if (!options || options.length === 0) return true;
  return options.every((opt) => selectedOptions[opt.id] !== undefined);
}

// ── Helper: Check if option value is available ──
function isOptionValueAvailable(
  optionId: number,
  valueId: number,
  selectedOptions: Record<number, number>,
  skus: ProductDetailResponse['skus'],
  options: ProductDetailResponse['options']
): boolean {
  // Check if any SKU is available with this combination
  const availableSkus = skus.filter((sku) => sku.quantity > 0);
  
  if (availableSkus.length === 0) return false;

  // Try to find any available SKU where this option value is used
  return availableSkus.some((sku) => {
    const optionIndex = options.findIndex((opt) => opt.id === optionId);
    if (optionIndex === -1) return true;
    
    // Direct ID comparison (backend returns IDs, not indices)
    return sku.optionValueIds[optionIndex] === valueId;
  });
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [matchingSku, setMatchingSku] = useState<ProductDetailResponse['skus'][number] | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "description">("specs");
  const [useMockData] = useState(false); // Set to true to test with mock data
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // For testing UI, set useMockData to true
        if (useMockData) {
          console.log("Using mock data for testing");
          setProduct(MOCK_PRODUCT);
          setSelectedOptions(getInitialSelectedOptions(MOCK_PRODUCT.options));
        } else {
          console.log("Fetching product with ID:", productId);
          const data = await getProductDetailAPI(productId);
          console.log("Product data received:", data);
          setProduct(data);
          setSelectedOptions(getInitialSelectedOptions(data.options));
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load product";
        console.error("Error loading product:", errorMsg, err);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, useMockData]);

  // ── Update matching SKU when selectedOptions changes ──
  useEffect(() => {
    if (!product || !product.skus || product.skus.length === 0) {
      setMatchingSku(null);
      return;
    }

    const matching = findMatchingSKU(selectedOptions, product.skus, product.options);
    setMatchingSku(matching);
  }, [selectedOptions, product]);

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Lỗi</p>
          <p className="text-on-surface-variant">{error || "Sản phẩm không tồn tại"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <main className="pt-28 pb-20">
      {/* Product Section */}
      <section className="max-w-360 mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Image Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface-container-lowest overflow-hidden rounded-xl">
            <img
              src={product.cover}
              alt={product.name}
              className="w-full aspect-4/3 object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface-container-low rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={product.cover}
                  alt={`${product.name} - ${i}`}
                  className="w-full aspect-square object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          <div>
            <span className="text-secondary font-bold tracking-widest text-xs uppercase mb-4 block">
              {product.summary}
            </span>
            <h1 className="text-5xl font-extrabold tracking-tighter text-primary mb-4">
              {product.name}
            </h1>
            {matchingSku ? (
              <div className="flex items-center gap-4">
                <p className="text-3xl font-light text-on-surface">
                  ${matchingSku.price.toFixed(2)}
                </p>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  matchingSku.quantity > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {matchingSku.quantity > 0 ? `${matchingSku.quantity} in stock` : "Out of stock"}
                </span>
              </div>
            ) : (
              <p className="text-3xl font-light text-on-surface-variant">
                Select options to see price
              </p>
            )}
          </div>

          <div className="flex flex-col gap-8">
            {/* Dynamic Options from Response */}
            {product.options && product.options.length > 0 ? (
              product.options.map((option) => (
                <div key={option.id}>
                  <label className="block font-label text-sm font-bold tracking-widest uppercase mb-4 text-on-surface/60">
                    {option.name}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.id] === value.id;
                      const isAvailable = isOptionValueAvailable(
                        option.id,
                        value.id,
                        selectedOptions,
                        product.skus || [],
                        product.options || []
                      );
                      const isDisabled = !isAvailable;

                      return (
                        <button
                          key={value.id}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [option.id]: value.id,
                              }));
                            }
                          }}
                          disabled={isDisabled}
                          className={`flex items-center justify-between px-5 py-4 rounded-lg transition-all ${
                            isSelected
                              ? "bg-surface-container-lowest border-2 border-secondary"
                              : isDisabled
                              ? "bg-surface-container-low opacity-50 cursor-not-allowed"
                              : "bg-surface-container-low hover:bg-surface-container-high cursor-pointer"
                          }`}
                        >
                          <span className={`font-medium ${
                            isSelected ? 'text-primary' : isDisabled ? 'text-on-surface-variant/50' : 'text-primary'
                          }`}>
                            {value.value}
                          </span>
                          {isSelected && (
                            <span
                              className="material-symbols-outlined text-secondary"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              check_circle
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-on-surface-variant text-sm">
                Không có tùy chọn sản phẩm
              </div>
            )}

            {/* Add to Cart */}
            <div className="pt-6">
              <button
                  onClick={async () => {
                    if (!areAllOptionsSelected(selectedOptions, product.options)) {
                      toast.error("Vui lòng chọn tất cả các tùy chọn");
                      return;
                    }
                    if (!matchingSku) {
                      toast.error("Sản phẩm này không có sẵn với các tùy chọn đã chọn");
                      return;
                    }
                    if (matchingSku.quantity <= 0) {
                      toast.error("Sản phẩm này đã hết hàng");
                      return;
                    }

                    setIsAddingToCart(true);
                    try {
                      const token = localStorage.getItem("accessToken");

                      const res = await fetch("http://localhost:8080/cart/add", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...(token && { Authorization: `Bearer ${token}` }),
                        },
                        body: JSON.stringify({
                          skuId: matchingSku.id,
                          quantity: 1,
                        }),
                      });

                      if (!res.ok) throw new Error(`HTTP ${res.status}`);

                      const json = await res.json();
                      if (json.code !== 200) throw new Error(`API error: ${json.code}`);

                      toast.success("Đã thêm vào giỏ hàng!");
                    } catch (err) {
                      console.error("Error adding to cart:", err);
                      toast.error("Thêm vào giỏ hàng thất bại");
                    } finally {
                      setIsAddingToCart(false);
                    }
                  }}
                disabled={
                  !areAllOptionsSelected(selectedOptions, product.options) ||
                  !matchingSku ||
                  matchingSku.quantity <= 0 ||
                  isAddingToCart
                }
                className="w-full py-6 bg-linear-to-r from-primary to-primary-container text-on-primary rounded-md text-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>

          {/* Description */}
        </div>
      </section>

      {/* Tabbed Product Details Section */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-20" id="product-details-tabs">
        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/30 mb-12">
          <button
            onClick={() => setActiveTab("specs")}
            className={`px-8 py-4 font-headline font-bold text-lg border-b-4 transition-all ${
              activeTab === "specs"
                ? "border-secondary text-primary"
                : "border-transparent text-on-surface-variant/60 hover:text-on-surface"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("description")}
            className={`px-8 py-4 font-headline font-semibold text-lg border-b-4 transition-all ${
              activeTab === "description"
                ? "border-secondary text-primary"
                : "border-transparent text-on-surface-variant/60 hover:text-on-surface"
            }`}
          >
            Description
          </button>
        </div>

        {/* Specifications Tab */}
        {activeTab === "specs" && (
          <div className="block animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-1">
              {product.specifications && product.specifications.length > 0 ? (
                product.specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between py-5 border-b border-outline-variant/10"
                  >
                    <span className="text-on-surface-variant font-medium">
                      {spec.name}
                    </span>
                    <span className="text-primary font-semibold">{spec.value}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-on-surface-variant">
                  <p>Không có thông số kỹ thuật</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="block animate-fadeIn">
            <div className="prose prose-sm max-w-none">
              <div className="text-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {product.description || "Không có mô tả sản phẩm"}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
    <Footer />
    </>
  );
}






