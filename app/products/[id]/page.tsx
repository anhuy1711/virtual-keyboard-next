"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProductDetailAPI, ProductDetailResponse } from "@/app/services/productService";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";

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
  skus: [],
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
function getInitialSelectedOptions(options?: any[]): Record<number, number> {
  if (!options || options.length === 0) return {};
  
  const initial: Record<number, number> = {};
  options.forEach(option => {
    if (option.values && option.values.length > 0) {
      initial[option.id] = option.values[0].id;
    }
  });
  
  return initial;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<"specs" | "description">("specs");
  const [useMockData] = useState(false); // Set to true to test with mock data

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
            <p className="text-3xl font-light text-on-surface-variant">
              $489.00
            </p>
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
                    {option.values.map((value) => (
                      <button
                        key={value.id}
                        onClick={() =>
                          setSelectedOptions((prev) => ({
                            ...prev,
                            [option.id]: value.id,
                          }))
                        }
                        className={`flex items-center justify-between px-5 py-4 rounded-lg transition-all ${
                          selectedOptions[option.id] === value.id
                            ? "bg-surface-container-lowest border-2 border-secondary"
                            : "bg-surface-container-low hover:bg-surface-container-high"
                        }`}
                      >
                        <span className="font-medium text-primary">
                          {value.value}
                        </span>
                        {selectedOptions[option.id] === value.id && (
                          <span
                            className="material-symbols-outlined text-secondary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                        )}
                      </button>
                    ))}
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
              <button className="w-full py-6 bg-linear-to-r from-primary to-primary-container text-on-primary rounded-md text-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">
                Add to Cart
              </button>
              <p className="mt-4 text-center text-sm text-on-surface-variant/60 font-medium">
                Free insured shipping worldwide. Ships in 2-3 business days.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-outline-variant/15 pt-8">
            <div className="flex gap-4 mb-4">
              <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                65% Layout
              </span>
              <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Gasket Mount
              </span>
              <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Hot-Swap PCB
              </span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              {product.description}
            </p>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
              <div>
                <h3 className="text-3xl font-extrabold tracking-tighter text-primary mb-6">
                  Acoustic Mastery
                </h3>
                <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
                  Experience the {product?.name} before it arrives. Our specialized typing test showcases the unique interaction between the mirror brass plate and Tangerine switches, recorded in a controlled studio environment using high-fidelity condenser microphones.
                </p>
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex items-center gap-4 text-on-surface">
                    <span className="material-symbols-outlined text-secondary">mic</span>
                    <span className="font-medium">Studio-Grade Audio Capture</span>
                  </div>
                  <div className="flex items-center gap-4 text-on-surface">
                    <span className="material-symbols-outlined text-secondary">vibration</span>
                    <span className="font-medium">Vibration Dampening Visualization</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-surface-container-low p-6 rounded-2xl">
                  <div className="relative overflow-hidden rounded-xl aspect-video bg-zinc-900 flex items-center justify-center">
                    <img
                      alt="Typing Test Video Thumbnail"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-ImkFI4LlCx9-DkLO9HgWIRZZy-KZ0OYqcpL2njhdnzhoal8P1npEsYPgtEVY6pkuxvkAvVDrU4AVpW18dBkiCkZtyqyoP0G6Uh139VEETnf7govoXwwkL1nhMNa3HBB9HwVl2jfEjujXGuNxCJ8MZ78ib8iqdc7AgxqKOq-ihHdeg5tc7k3PuZqiCE2N09TiAHQisOAkiaIzNdSigYZ6W1xVwU1E_jqA7osPSW9yCRZC4ekj57fRTDjAlLw9HgckXXDdmO6Mmy4"
                    />
                    <button className="relative z-10 w-16 h-16 bg-secondary text-on-secondary rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow">
                      <span className="material-symbols-outlined text-3xl">play_arrow</span>
                    </button>
                  </div>
                </div>
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






