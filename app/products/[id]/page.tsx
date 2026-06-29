"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProductDetailAPI, ProductDetailResponse } from "@/app/services/productService";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import {toast} from "react-toastify";
import { buildProductGalleryImages } from "@/app/products/product-images.mjs";
import {
  getProductReviewsAPI,
  ProductReviewResponse,
} from "@/app/services/productReviewService";

// Mock data for testing UI

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
  if (!skus || skus.length === 0) return null;

  // Sản phẩm không có biến thể/options: lấy SKU mặc định đầu tiên
  if (!options || options.length === 0) {
    return skus.find((sku) => sku.isActive && sku.quantity > 0) || skus[0];
  }

  const optionValueIds = options.map((opt) => {
    const selectedValueId = selectedOptions[opt.id];
    if (!selectedValueId) return -1;
    return selectedValueId;
  });

  return (
      skus.find(
          (sku) =>
              JSON.stringify(sku.optionValueIds) === JSON.stringify(optionValueIds)
      ) || null
  );
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
const formatCurrency = (value: number) => {
  return Number(value || 0).toLocaleString('vi-VN') + '₫';
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [matchingSku, setMatchingSku] = useState<ProductDetailResponse['skus'][number] | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "description" | "reviews">("specs");  const [useMockData] = useState(false); // Set to true to test with mock data
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<ProductReviewResponse[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [selectedImage, setSelectedImage] = useState("");
  const [thumbnailStart, setThumbnailStart] = useState(0);
  const [hasUserSelectedOption, setHasUserSelectedOption] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
        <span
            key={index}
            className={`material-symbols-outlined text-[18px] ${
                index < rating ? "text-secondary" : "text-outline-variant"
            }`}
            style={index < rating ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
      star
    </span>
    ));
  };

  const averageRating =
      reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => review.rating === star).length;
    const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;

    return {
      star,
      count,
      percent,
    };
  });
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // For testing UI, set useMockData to true
        if (useMockData) {
        } else {
          const data = await getProductDetailAPI(productId);
          setProduct(data);
          setSelectedOptions(getInitialSelectedOptions(data.options));
          setSelectedImage(data.cover);
          setThumbnailStart(0);
          setHasUserSelectedOption(false);
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

  useEffect(() => {
    if (!hasUserSelectedOption) return;
    setSelectedImage(matchingSku?.imageUrl || product?.cover || "");
  }, [hasUserSelectedOption, matchingSku, product]);

  useEffect(() => {
    if (!product || !hasUserSelectedOption || !matchingSku?.imageUrl) return;

    const images = buildProductGalleryImages(product);

    if (images.length <= 4) return;

    const matchingIndex = images.findIndex((image) => image.imageUrl === matchingSku.imageUrl);
    if (matchingIndex < 0) return;

    setThumbnailStart((current) => {
      if (matchingIndex >= current && matchingIndex < current + 4) {
        return current;
      }
      return Math.min(matchingIndex, images.length - 4);
    });
  }, [hasUserSelectedOption, matchingSku, product]);

  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);

      const data = await getProductReviewsAPI(productId, 0, 10);

      setReviews(data.content || []);
      setReviewTotal(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast.error("Không thể tải đánh giá sản phẩm");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId]);

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

  const galleryImages = buildProductGalleryImages(product);
  const visibleGalleryImages = galleryImages.slice(thumbnailStart, thumbnailStart + 4);
  const canSlideThumbnails = galleryImages.length > 4;
  const displayImage = selectedImage || product.cover;

  return (
    <>
      <TopNav />
      <main className="pt-28 pb-20">
      {/* Product Section */}
      <section className="max-w-360 mx-auto px-6 md:px-30 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Image Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface-container-lowest overflow-hidden rounded-xl">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full aspect-4/3 object-cover"
            />
          </div>
          <div className="flex items-center gap-3">
            {canSlideThumbnails && (
              <button
                type="button"
                onClick={() => setThumbnailStart((current) => Math.max(0, current - 1))}
                disabled={thumbnailStart === 0}
                className="h-11 w-11 shrink-0 rounded-full border border-outline-variant/30 bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Anh SKU truoc"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}

            <div className="grid grid-cols-4 gap-4 flex-1">
              {visibleGalleryImages.map((image) => (
                <button
                  type="button"
                  key={`${image.type}-${image.id}`}
                  onClick={() => setSelectedImage(image.imageUrl)}
                  className={`bg-surface-container-low rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 ${
                    selectedImage === image.imageUrl ? "border-secondary" : "border-transparent"
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={
                      image.type === "cover"
                        ? `${product.name} - anh bia`
                        : `${product.name} - ${image.sku || "SKU"}`
                    }
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>

            {canSlideThumbnails && (
              <button
                type="button"
                onClick={() =>
                  setThumbnailStart((current) => Math.min(galleryImages.length - 4, current + 1))
                }
                disabled={thumbnailStart >= galleryImages.length - 4}
                className="h-11 w-11 shrink-0 rounded-full border border-outline-variant/30 bg-surface-container-lowest flex items-center justify-center text-primary hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Anh SKU tiep theo"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}
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
                  {formatCurrency(matchingSku.price)}
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
                                      setHasUserSelectedOption(true);
                                      setSelectedOptions((prev) => ({
                                        ...prev,
                                        [option.id]: value.id,
                                      }));
                                    }
                                  }}
                                  disabled={isDisabled}
                                  className={`flex items-center justify-between px-5 py-2 rounded-lg transition-all ${
                                      isSelected
                                          ? "bg-surface-container-lowest border-2 border-secondary"
                                          : isDisabled
                                              ? "bg-surface-container-low opacity-50 cursor-not-allowed"
                                              : "bg-surface-container-low hover:bg-surface-container-high cursor-pointer"
                                  }`}
                              >
              <span
                  className={`font-medium ${
                      isSelected
                          ? "text-primary"
                          : isDisabled
                              ? "text-on-surface-variant/50"
                              : "text-primary"
                  }`}
              >
                {value.value}
              </span>


                              </button>
                          );
                        })}
                      </div>
                    </div>
                ))
            ) : (
                <div className="rounded-lg bg-surface-container-low px-5 py-4 text-sm text-on-surface-variant">
                  Sản phẩm này không có biến thể. Bạn có thể thêm trực tiếp vào giỏ hàng.
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
                className="w-full py-6 bg-primary text-on-primary rounded-md text-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
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
            Thông số kỹ thuật
          </button>
          <button
            onClick={() => setActiveTab("description")}
            className={`px-8 py-4 font-headline font-semibold text-lg border-b-4 transition-all ${
              activeTab === "description"
                ? "border-secondary text-primary"
                : "border-transparent text-on-surface-variant/60 hover:text-on-surface"
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
              onClick={() => setActiveTab("reviews")}
              className={`px-8 py-4 font-headline font-semibold text-lg border-b-4 transition-all ${
                  activeTab === "reviews"
                      ? "border-secondary text-primary"
                      : "border-transparent text-on-surface-variant/60 hover:text-on-surface"
              }`}
          >
            Đánh giá
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
        {activeTab === "reviews" && (
            <div className="block animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Review Summary */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6">
                    <h3 className="text-2xl font-extrabold tracking-tight text-primary mb-2">

                    </h3>

                    <div className="flex items-end gap-3 mb-5">
            <span className="text-5xl font-bold text-primary">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>

                      <div className="flex flex-col">
                        <div className="flex">
                          {renderStars(Math.round(averageRating))}
                        </div>

                        <span className="text-xs font-medium text-on-surface-variant/60 uppercase tracking-widest mt-1">
                Dựa trên tổng số {reviewTotal} đánh giá
              </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {ratingCounts.map((item) => (
                          <div key={item.star} className="flex items-center gap-4">
                <span className="text-sm font-medium w-4 text-on-surface-variant">
                  {item.star}
                </span>

                            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                              <div
                                  className="h-full bg-secondary"
                                  style={{ width: `${item.percent}%` }}
                              />
                            </div>

                            <span className="text-sm font-medium w-10 text-on-surface-variant/60">
                  {item.percent}%
                </span>
                          </div>
                      ))}
                    </div>
                  </div>

                  {/*<button*/}
                  {/*    type="button"*/}
                  {/*    onClick={() =>*/}
                  {/*        toast.info("Bạn có thể đánh giá sản phẩm trong màn chi tiết đơn hàng đã hoàn thành")*/}
                  {/*    }*/}
                  {/*    className="w-full py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all"*/}
                  {/*>*/}
                  {/*  Viết đánh giá*/}
                  {/*</button>*/}

                </div>

                {/* Review List */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                  {isLoadingReviews ? (
                      <div className="py-12 text-center text-on-surface-variant">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        Đang tải đánh giá...
                      </div>
                  ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                          <div
                              key={review.id}
                              className="pb-8 border-b border-outline-variant/30"
                          >
                            <div className="flex justify-between items-start mb-4 gap-4">
                              <div>
                                <div className="flex mb-1">
                                  {renderStars(review.rating)}
                                </div>

                                <h4 className="font-bold text-lg text-on-surface">
                                  {review.fullName || review.username || `User #${review.userId}`}
                                </h4>
                              </div>

                              <span className="text-sm text-on-surface-variant/60 whitespace-nowrap">
                  {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                      : ""}
                </span>
                            </div>

                            <p className="text-on-surface-variant leading-relaxed italic">
                              “{review.comment || "Không có nội dung đánh giá."}”
                            </p>
                          </div>
                      ))
                  ) : (
                      <div className="py-12 text-center text-on-surface-variant/60 font-medium border border-dashed border-outline-variant/30 rounded-xl">
                        Sản phẩm này chưa có đánh giá nào.
                      </div>
                  )}
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






