"use client";

import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  imageAlt: string;
  layout: string;
  material: string;
  status?: "In Stock" | "Best Seller" | "Pre-Order";
  isHighlight?: boolean;
  description?: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Atelier Envoy 65",
    price: 285,
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/484/752/products/game-1989-black-with-gb65-pvd-14-1770641796154.jpg?v=1770642593683",
    imageAlt:
      "Close-up of a minimalist mechanical keyboard with matte cream keycaps",
    layout: "65% Layout",
    material: "Aluminum Shell",
    status: "In Stock",
  },
  {
    id: "2",
    name: "Monolith TKL",
    price: 420,
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/484/752/products/game-1989-black-with-gb65-pvd-14-1770641796154.jpg?v=1770642593683",
    imageAlt: "Detailed macro shot of mechanical switches with polycarbonate case",
    layout: "TKL",
    material: "Brass Plate",
    status: "Best Seller",
  },
  {
    id: "3",
    name: "Nostalgia Pro 60",
    price: 195,
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/484/752/products/game-1989-black-with-gb65-pvd-14-1770641796154.jpg?v=1770642593683",
    imageAlt: "Top down view of a vintage inspired beige mechanical keyboard",
    layout: "60% Layout",
    material: "PBT Keycaps",
  },
  {
    id: "4",
    name: "Aether Gasket 75",
    price: 340,
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/484/752/products/game-1989-black-with-gb65-pvd-14-1770641796154.jpg?v=1770642593683",
    imageAlt: "Sleek silver aluminum mechanical keyboard with RGB backlighting",
    layout: "75% Layout",
    material: "Hot-swap",
  },
  {
    id: "5",
    name: "Heirloom Walnut 80",
    price: 890,
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/484/752/products/game-1989-black-with-gb65-pvd-14-1770641796154.jpg?v=1770642593683",
    imageAlt: "Handcrafted dark wood mechanical keyboard case with brass weight",
    layout: "80% Layout",
    material: "Walnut Wood",
    status: "Pre-Order",
    description:
      "Solid North American Walnut, hand-oiled finish, with a sandblasted brass bottom weight. A legacy piece for the modern workspace.",
  },
  {
    id: "6",
    name: "Chroma Barebone",
    price: 120,
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/484/752/products/game-1989-black-with-gb65-pvd-14-1770641796154.jpg?v=1770642593683",
    imageAlt: "Extreme close up of colorful custom artisan keycaps",
    layout: "Variable",
    material: "Barebone Kit",
  },
  {
    id: "7",
    name: "Ivory Slate 75",
    price: 210,
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/484/752/products/game-1989-black-with-gb65-pvd-14-1770641796154.jpg?v=1770642593683",
    imageAlt: "Profile view of a minimalist white keyboard with gray accents",
    layout: "75% Layout",
    material: "FR4 Plate",
  },
];

export default function ProductsGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const sortOptions = [
    { id: "newest", label: "Mới nhất" },
    { id: "price-low", label: "Giá thấp đến cao" },
    { id: "price-high", label: "Giá cao đến thấp" },
    { id: "name-asc", label: "Tên A - Z" },
    { id: "name-desc", label: "Tên Z - A" },
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="pt-32 pb-20 px-12 max-w-[1920px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-8">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase font-label">
              The Collection
            </span>
            <h1 className="text-5xl font-extrabold text-primary tracking-tighter">
              Precision Implements
            </h1>
          </div>
          <div className="text-sm text-on-surface-variant font-medium">
            Showing{" "}
            <span className="text-primary font-bold">{filteredProducts.length}</span> of{" "}
            <span className="text-primary font-bold">{products.length}</span> products
          </div>
        </div>

        {/* Top Sorting/Filtering Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-y border-outline-variant/15 mb-12">
          <div className="flex items-center gap-4 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs font-bold tracking-widest text-primary/60 uppercase font-label whitespace-nowrap">
              Sắp xếp theo:
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
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border-none text-sm text-on-surface rounded-full px-5 py-2.5 focus:ring-2 focus:ring-secondary/20 placeholder:text-on-surface-variant/50"
            />
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl">
              search
            </span>
          </div>
        </div>

        {/* Bento-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 mb-16">
          {filteredProducts.map((product) =>
            product.isHighlight ? (
              // Highlight Card - spans 2 columns
              <div
                key={product.id}
                className="lg:col-span-2 group flex flex-col md:flex-row bg-surface-container-lowest overflow-hidden rounded-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 border border-outline-variant/10"
              >
                <div className="w-full md:w-2/5 relative aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center space-y-4 flex-1">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-secondary">
                    Artisan Limited Edition
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tighter text-primary font-headline">
                    {product.name}
                  </h2>
                  <p className="text-on-surface-variant text-xs leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-primary font-body">
                      ${product.price.toFixed(2)}
                    </span>
                    <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-4 py-2.5 text-[10px] font-bold rounded-md tracking-widest uppercase transition-transform active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/30">
                      Pre-Order
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Regular Product Card
              <div key={product.id} className="group flex flex-col space-y-6">
                <div className="relative aspect-square bg-surface-container-low overflow-hidden rounded-lg transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/5">
                  <img
                    src={product.image}
                    alt={product.imageAlt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.status && (
                    <div
                      className={`absolute top-4 right-4 px-3 py-1 rounded-full backdrop-blur-sm ${
                        product.status === "In Stock"
                          ? "bg-surface-container-lowest/90"
                          : product.status === "Best Seller"
                          ? "bg-primary/90 text-white"
                          : "bg-secondary/90 text-white"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold tracking-widest uppercase ${
                          product.status === "In Stock" ? "text-primary" : "text-white"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 px-1">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold tracking-tight text-on-surface group-hover:text-secondary transition-colors font-headline">
                      {product.name}
                    </h2>
                    <span className="text-lg font-semibold text-primary font-body">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-tertiary-fixed text-[10px] font-bold uppercase tracking-tighter text-on-tertiary-fixed rounded-full">
                      {product.layout}
                    </span>
                    <span className="px-3 py-1 bg-surface-container-high text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant rounded-full">
                      {product.material}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
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
            {[1, 2, 3].map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                  currentPage === pageNum
                    ? "bg-primary text-on-primary"
                    : "hover:bg-surface-container text-on-surface"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <span className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
              ...
            </span>
            <button className="w-10 h-10 rounded-full hover:bg-surface-container transition-colors text-on-surface font-bold text-xs flex items-center justify-center">
              8
            </button>
          </div>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-3 border border-outline-variant/15 rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
