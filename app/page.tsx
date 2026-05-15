"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import {
  BannerResponse,
  getBannersByPositionAPI,
} from "@/app/services/bannerService";

import {
  HomeProductResponse,
  getHomeKeyboardsAPI,
  getHomeComponentsAPI,
} from "@/app/services/homeProductService";

const SPECS = [
  {
    id: "cnc",
    icon: "precision_manufacturing",
    title: "CNC Machined",
    description: "Aerospace-grade aluminum for zero-flex stability.",
  },
  {
    id: "pvd",
    icon: "palette",
    title: "PVD Coating",
    description:
      "Deep, durable finishes that resist wear and enhance tactile resonance.",
  },
  {
    id: "sound-profiles",
    icon: "waves",
    title: "Sound Profiles",
    description:
      "Engineered acoustic cavities for that perfect 'thocky' signature sound.",
  },
  {
    id: "lifetime-support",
    icon: "verified_user",
    title: "Lifetime Support",
    description:
      "Dedicated enthusiast support for your building journey and beyond.",
  },
];

export default function Home() {
  const [keyboardTab, setKeyboardTab] = useState("in-stock");
  const [componentTab, setComponentTab] = useState("keycaps");

  const [heroBanners, setHeroBanners] = useState<BannerResponse[]>([]);
  const [secondaryBanners, setSecondaryBanners] = useState<BannerResponse[]>([]);
  const [isBannerLoading, setIsBannerLoading] = useState(true);

  const [keyboards, setKeyboards] = useState<HomeProductResponse[]>([]);
  const [components, setComponents] = useState<HomeProductResponse[]>([]);
  const [isKeyboardLoading, setIsKeyboardLoading] = useState(true);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  useEffect(() => {
    const fetchKeyboards = async () => {
      try {
        setIsKeyboardLoading(true);
        const data = await getHomeKeyboardsAPI(
            keyboardTab as "in-stock" | "hot"
        );
        setKeyboards(data);
      } catch (error) {
        console.error(error);
        setKeyboards([]);
      } finally {
        setIsKeyboardLoading(false);
      }
    };

    fetchKeyboards();
  }, [keyboardTab]);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setIsComponentLoading(true);
        const data = await getHomeComponentsAPI(
            componentTab as "keycaps" | "switches"
        );
        setComponents(data);
      } catch (error) {
        console.error(error);
        setComponents([]);
      } finally {
        setIsComponentLoading(false);
      }
    };

    fetchComponents();
  }, [componentTab]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const [heroData, secondaryData] = await Promise.all([
          getBannersByPositionAPI("HERO"),
          getBannersByPositionAPI("SECONDARY"),
        ]);

        setHeroBanners(heroData);
        setSecondaryBanners(secondaryData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsBannerLoading(false);
      }
    };

    fetchBanners();
  }, []);
  const secondaryBanner = secondaryBanners[0];
  return (
    <>
      <TopNav />
      <main className="pt-20">
        {/* 1. Sliding Hero Banner */}
        <section className="layout-container">
          <div className="relative h-[320px] md:h-[420px] lg:h-[500px] xl:h-[560px] overflow-hidden bg-surface-container-low rounded-xl mt-8">
            <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">              {/* Slide 1 */}
            {heroBanners.length > 0 ? (
                heroBanners.map((banner) => (
                    <div key={banner.id} className="flex-none w-full h-full snap-center relative">
                      <img
                          alt={banner.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          src={banner.imageUrl}
                      />

                      <div className="absolute inset-0 bg-black/20"></div>

                      <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-24">
                        <div className="max-w-2xl text-on-primary">
                          {banner.description && (
                              <span className="font-label text-xs md:text-sm uppercase tracking-[0.2em] mb-4 block font-semibold">
              {banner.description}
            </span>
                          )}

                          <h2 className="font-headline text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                            {banner.title}
                          </h2>

                          {banner.buttonText && (
                              <Link
                                  href={banner.link || "/products"}
                                  className="inline-block px-8 py-4 bg-primary-container text-on-primary-container rounded-md font-semibold hover:scale-95 transition-transform"
                              >
                                {banner.buttonText}
                              </Link>
                          )}
                        </div>
                      </div>
                    </div>
                ))
            ) : (
                <div className="flex-none w-full h-full snap-center relative bg-surface-container-low flex items-center justify-center">
                  <p className="text-on-surface-variant">
                    {isBannerLoading ? "Đang tải banner..." : "Chưa có hero banner"}
                  </p>
                </div>
            )}
            </div>
            {/* Slider Controls */}
            {heroBanners.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                  {heroBanners.map((banner, index) => (
                      <div
                          key={banner.id}
                          className={`w-3 h-3 rounded-full ${
                              index === 0 ? "bg-primary" : "bg-primary/30"
                          }`}
                      ></div>
                  ))}
                </div>
            )}
          </div>
        </section>

        {/* 2. Keyboards Section with Tabs */}
        <section className="py-16 md:py-24 bg-surface">
          <div className="layout-container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
                  Keyboards
                </h2>
                <div className="flex gap-8 border-b border-outline-variant">
                  <button
                    onClick={() => setKeyboardTab("in-stock")}
                    className={`pb-4 font-bold tracking-tight border-b-2 transition-all ${
                      keyboardTab === "in-stock"
                        ? "text-primary border-primary"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                    }`}
                  >
                    In-stock
                  </button>
                  <button
                    onClick={() => setKeyboardTab("hot")}
                    className={`pb-4 font-medium tracking-tight border-b-2 transition-all ${
                      keyboardTab === "hot"
                        ? "text-primary border-primary"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                    }`}
                  >
                    Hot
                  </button>
                </div>
              </div>
              <Link
                href="/products"
                className="font-label font-bold text-xs md:text-sm uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1 mb-1"
              >
                View All Keyboards
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {isKeyboardLoading ? (
                  <p className="col-span-full text-center text-on-surface-variant">
                    Đang tải sản phẩm...
                  </p>
              ) : keyboards.length === 0 ? (
                  <p className="col-span-full text-center text-on-surface-variant">
                    Chưa có sản phẩm keyboard
                  </p>
              ) : (
                  keyboards.map((kb) => (
                      <Link href={`/products/${kb.id}`} key={kb.id} className="group block">
                        <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-4 relative">
                          <img
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              src={kb.image}
                              alt={kb.name}
                          />
                        </div>

                        <h3 className="font-headline text-lg md:text-xl font-bold text-primary line-clamp-2">
                          {kb.name}
                        </h3>

                        <p className="text-on-surface-variant font-medium">
                          ${Number(kb.price ?? 0).toFixed(2)}
                        </p>
                      </Link>
                  ))
              )}
            </div>
          </div>
        </section>

        {/* 3. Secondary Full-Width Banner */}
        {/* 3. Secondary Full-Width Banner */}
        {secondaryBanner && (
            <section className="w-full py-12">
              <div className="layout-container">
                <div className="relative h-[280px] md:h-[380px] lg:h-[480px] rounded-xl overflow-hidden">
                  <img
                      className="w-full h-full object-cover"
                      src={secondaryBanner.imageUrl}
                      alt={secondaryBanner.title}
                  />

                  <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center text-center p-6">
                    <div className="max-w-3xl">
                      <h2 className="font-headline text-2xl md:text-4xl lg:text-5xl font-bold text-on-primary mb-6">
                        {secondaryBanner.title}
                      </h2>

                      {secondaryBanner.description && (
                          <p className="text-base md:text-lg text-on-primary/90 mb-8 max-w-xl mx-auto">
                            {secondaryBanner.description}
                          </p>
                      )}

                      {secondaryBanner.buttonText && (
                          <Link
                              href={secondaryBanner.link || "/products"}
                              className="inline-block bg-surface text-primary px-8 md:px-10 py-3 md:py-4 rounded-md font-bold hover:bg-secondary-fixed transition-colors"
                          >
                            {secondaryBanner.buttonText}
                          </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
        )}

        {/* 4. Components Section with Tabs */}
        <section className="py-24 bg-surface-container-low">
          <div className="layout-container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary tracking-tight mb-4">
                  Components
                </h2>
                <div className="flex gap-8 border-b border-outline-variant">
                  <button
                    onClick={() => setComponentTab("keycaps")}
                    className={`pb-4 font-bold tracking-tight border-b-2 transition-all ${
                      componentTab === "keycaps"
                        ? "text-primary border-primary"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                    }`}
                  >
                    Keycaps
                  </button>
                  <button
                    onClick={() => setComponentTab("switches")}
                    className={`pb-4 font-medium tracking-tight border-b-2 transition-all ${
                      componentTab === "switches"
                        ? "text-primary border-primary"
                        : "text-on-surface-variant border-transparent hover:text-primary"
                    }`}
                  >
                    Switches
                  </button>
                </div>
              </div>
              <Link
                href="/products"
                className="font-label font-bold text-xs md:text-sm uppercase tracking-widest text-primary border-b-2 border-primary/20 hover:border-primary transition-all pb-1 mb-1"
              >
                Explore All Components
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {isComponentLoading ? (
                  <p className="col-span-full text-center text-on-surface-variant">
                    Đang tải linh kiện...
                  </p>
              ) : components.length === 0 ? (
                  <p className="col-span-full text-center text-on-surface-variant">
                    Chưa có linh kiện
                  </p>
              ) : (
                  components.map((comp) => (
                      <Link href={`/products/${comp.id}`} key={comp.id} className="group block">
                        <div className="aspect-square rounded-lg overflow-hidden bg-surface-container-lowest mb-4">
                          <img
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              src={comp.image}
                              alt={comp.name}
                          />
                        </div>

                        <h4 className="font-bold text-primary text-sm md:text-base line-clamp-2">
                          {comp.name}
                        </h4>

                        <p className="text-xs md:text-sm text-on-surface-variant">
                          ${Number(comp.price ?? 0).toFixed(2)}
                        </p>
                      </Link>
                  ))
              )}
            </div>
          </div>
        </section>

        {/* Aesthetic Spec Grid */}
        <section className="py-16 md:py-24 bg-surface border-t border-outline-variant/15">
          <div className="layout-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
            {SPECS.map((spec) => (
              <div key={spec.id} className="text-center md:text-left">
                <span
                  className="material-symbols-outlined text-secondary text-4xl mb-4 block"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {spec.icon}
                </span>
                <h4 className="font-headline font-bold text-primary mb-2">
                  {spec.title}
                </h4>
                <p className="text-sm text-on-surface-variant font-body">
                  {spec.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
