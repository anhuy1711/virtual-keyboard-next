"use client";

import TopNav from "@/app/components/top-nav";
import ProductsGrid from "@/app/components/products-grid";
import Footer from "@/app/components/footer";

export default function ProductsPage() {
  return (
    <>
      <TopNav />
      <main className="pt-20">
        <ProductsGrid />
      </main>
      <Footer />
    </>
  );
}

