"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  filterProductsAPI,
  getProductDetailAPI,
  ProductResponse,
} from "@/app/services/productService";
import { useSearchParams } from "next/navigation";

interface Product extends ProductResponse {
  isHighlight?: boolean;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
}

const formatCurrency = (value: number) => {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
};

const getProductPriceLabel = (product: Product) => {
  if (typeof product.minPrice === "number" && Number.isFinite(product.minPrice)) {
    if (
      typeof product.maxPrice === "number" &&
      Number.isFinite(product.maxPrice) &&
      product.maxPrice > product.minPrice
    ) {
      return `${formatCurrency(product.minPrice)}`;
    }

    return formatCurrency(product.minPrice);
  }

  if (typeof product.price === "number" && Number.isFinite(product.price)) {
    return formatCurrency(product.price);
  }

  const skuPrices = (product.skus || [])
    .filter((sku) => sku.isActive !== false)
    .map((sku) => Number(sku.price))
    .filter((price) => Number.isFinite(price));

  if (skuPrices.length === 0) {
    return null;
  }

  const minPrice = Math.min(...skuPrices);
  const maxPrice = Math.max(...skuPrices);

  return minPrice === maxPrice
    ? formatCurrency(minPrice)
    : `${formatCurrency(minPrice)}`;
};

export default function ProductsGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const ITEMS_PER_PAGE = 12;
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";
  const categoryId = searchParams.get("categoryId");
  const parsedCategoryId = categoryId ? Number(categoryId) : undefined;
  const selectedCategoryId = Number.isFinite(parsedCategoryId) ? parsedCategoryId : undefined;

  useEffect(() => {
    setSearchQuery(name);
    setCurrentPage(1);
  }, [name, categoryId]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await filterProductsAPI(
          {
            name: searchQuery || undefined,
            categoryId: selectedCategoryId,
            sortBy: sortBy !== "newest" ? sortBy : undefined,
          },
          currentPage - 1,
          ITEMS_PER_PAGE
        );
        const productsWithPrices = await Promise.all(
          response.content.map(async (product) => {
            const productWithOptionalPrice = product as Product;

            if (
              typeof productWithOptionalPrice.price === "number" ||
              typeof productWithOptionalPrice.minPrice === "number" ||
              (productWithOptionalPrice.skus?.length ?? 0) > 0
            ) {
              return productWithOptionalPrice;
            }

            try {
              const detail = await getProductDetailAPI(product.id);

              return {
                ...productWithOptionalPrice,
                skus: detail.skus,
              };
            } catch (detailError) {
              console.error(
                `Error fetching product price for ${product.id}:`,
                detailError
              );
              return productWithOptionalPrice;
            }
          })
        );

        setProducts(productsWithPrices);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, sortBy, searchQuery, selectedCategoryId]);

  const sortOptions = [
    { id: "newest", label: "Mới nhất" },
    { id: "price-low", label: "Giá thấp đến cao" },
    { id: "price-high", label: "Giá cao đến thấp" },
    { id: "name-asc", label: "Tên A - Z" },
    { id: "name-desc", label: "Tên Z - A" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fcf9f8" }}>
      <div className="layout-container pt-12 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-8">
          <div className="space-y-2">

            <h1 className="text-5xl font-extrabold text-primary tracking-tighter">
              Bàn phím
            </h1>
          </div>
          <div className="text-sm text-on-surface-variant font-medium">
            {isLoading ? (
              <span>Đang tải...</span>
            ) : (
              <>
                Hiển thị{" "}
                <span className="text-primary font-bold">{products.length}</span>{" "}
                / <span className="text-primary font-bold">{totalElements}</span>
              </>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            <p className="font-semibold">Lỗi</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Sorting/Filtering Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-y border-outline-variant/15 ">
          <div className="flex items-center gap-4 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs font-bold tracking-widest text-primary/60 uppercase font-label whitespace-nowrap">
              Sắp xếp:
            </span>
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
                    sortBy === option.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-container border-none text-sm text-on-surface rounded-full px-5 py-2.5 focus:ring-2 focus:ring-secondary/20"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">
              search
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-on-surface-variant">Đang tải sản phẩm...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-on-surface-variant text-lg">
                Không tìm thấy sản phẩm
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 mb-16">
              {products.map((product) => {
                const priceLabel = getProductPriceLabel(product);

                return (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div className="group flex flex-col space-y-6 cursor-pointer">
                      <div className="relative aspect-square bg-surface-container-low overflow-hidden rounded-lg transition-all duration-500 group-hover:shadow-2xl">
                        <img
                          src={product.cover}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-2 px-1">
                        <h2 className="text-xl font-bold tracking-tight text-on-surface group-hover:text-secondary transition-colors">
                          {product.name}
                        </h2>
                        {priceLabel && (
                          <p className="text-base font-semibold text-primary">
                            {priceLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-24 flex items-center justify-center space-x-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-3 border border-outline-variant/15 rounded-full hover:bg-surface-container transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div className="flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                      currentPage === i + 1
                        ? "bg-primary text-on-primary"
                        : "hover:bg-surface-container text-on-surface"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 5 && (
                  <>
                    <span className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                      ...
                    </span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-10 h-10 rounded-full text-on-surface font-bold text-xs flex items-center justify-center ${
                        currentPage === totalPages
                          ? "bg-primary text-on-primary"
                          : "hover:bg-surface-container"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-3 border border-outline-variant/15 rounded-full hover:bg-surface-container transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

