"use client";

import { useState } from "react";
import Link from "next/link";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";

// Mock data for keyboards
const KEYBOARDS = [
  {
    id: 1,
    name: "Atelier 65 SE",
    price: 450,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGwFqMhJQ5oO8hK8HOIqKPWvw_w151n_iQ6qNPrfkAVP9cCl9IPDPhkvjhQ6DVTTCaKMPFW6IVhQxEDG0YFhcRVqSasySQW_NTVmQn-9ooH-uOouYUkP9VyRkZazfm2rS5sSNWTxigvx_rDUKN7_EL2ly46zX85wLJ7mJc8ApUdLDtJZHH7T3rts-D31XNEQUC4UxU_FuvG_yg2DP4eXAOWqNXP5qfDW7upGaqbGBbBMAovbsLxzDgP6MfSaF9lcF5FEPEAEY7Ioc",
    badge: "Ready to Ship",
  },
  {
    id: 2,
    name: "Foundation TKL",
    price: 380,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHlNO21wA8fimNEsyxE46agplEdBq4dmnhILplAKAdY7wvziHdPJknO4wsK8JH_qWT3EkQM1Ygp8FLHXN5Jr_TkNW3aKA7K9xtUHBbUdhTWqbdzVyhyo92F9Tg7DYmk7W8Rd1667cvtCTzz-2-cQCTeRyEwSMfFt5JuMjzEB93iv9IZ5jHtztwOfRhcY7Xd4I2fRSrz5BciH_potBs2bMdUd8ZLbvHz_9eXCYIHoNzSr_pl6s7qJRPQpHGG_e427qfCNKWpt6fBYA",
    badge: null,
  },
  {
    id: 3,
    name: "Numpad Lite",
    price: 120,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlaEjjy-zCn8qRRRYh6AkbnNqkIdkzUhr8RT7D2a3eOCixyzGz9_FTmk2sapno9qUfRqYBiZRBp9HOspZ5QvvMLAsCKm0Uk5-qgUcL2glT_EWGklaYdwOhgIDs8kzauXStncK51uBfwPpFAoXbUdYWDIRCb-hi26esdLupT1ANu_aA0W0fV-DK7Gmf7Jn_PtGxF9epuZkNqRe11U6WovsPHr9fsXi0gFmiHTQdmfwBj3Pa4ehoN2-yjkF0OLjpksyee5Y3o_O_oGc",
    badge: null,
  },
  {
    id: 4,
    name: "Vertex Arc",
    price: 320,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBz2neMSTD_YS6gHy8mUjCzDqGjzM4ELT7CUem-QwP6ypd5x5hOJFuIppAEc6C4B0WSnnddTcTyp758yVALM0PkRLQqIpHVPStHb5kcbaRr5xQmJ8NK4VOkDW1Gpqij68TtqFM5ZrpkDMwZW1-Ef6Q-rPfNrwwc8LOCwzdHwM06HUymaexBleyMktDybbdW2OabanXf8qF338yP3i3YiWanEd8dCjlpeqFqEOlATRHNhaeFFl0pm01Z-hmNKwIbYvyf9ydAhzSXy1g",
    badge: null,
  },
  {
    id: 5,
    name: "Lunar 60",
    price: 295,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoqaRPQrETFYzAuzX8nXryrc9vVGxIMKHxKrDGLWC8vbX5yC_fYIdOUsomo293UxcVHQvIBByZKlm6PO-KHZhyDtvIXsIWTUJ2HHM6iek3Ig1c4eVcnnFxSAOSrq21ALIKm_guwa_v5YauosQRRGkN5ILvYsvkwir1miLxB416IFZBhwu0UQDwoWb8a2hYj97YiVeLe_quy7GeMvy_b0aIXN4Ncn1RSMFlk65WvrROfb9qsrz8VwixLNgxkQGJGpTCmAaEhLBGUxM",
    badge: null,
  },
  {
    id: 6,
    name: "Atelier Mini",
    price: 210,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHlNO21wA8fimNEsyxE46agplEdBq4dmnhILplAKAdY7wvziHdPJknO4wsK8JH_qWT3EkQM1Ygp8FLHXN5Jr_TkNW3aKA7K9xtUHBbUdhTWqbdzVyhyo92F9Tg7DYmk7W8Rd1667cvtCTzz-2-cQCTeRyEwSMfFt5JuMjzEB93iv9IZ5jHtztwOfRhcY7Xd4I2fRSrz5BciH_potBs2bMdUd8ZLbvHz_9eXCYIHoNzSr_pl6s7qJRPQpHGG_e427qfCNKWpt6fBYA",
    badge: null,
  },
  {
    id: 7,
    name: "Split Studio",
    price: 520,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGwFqMhJQ5oO8hK8HOIqKPWvw_w151n_iQ6qNPrfkAVP9cCl9IPDPhkvjhQ6DVTTCaKMPFW6IVhQxEDG0YFhcRVqSasySQW_NTVmQn-9ooH-uOouYUkP9VyRkZazfm2rS5sSNWTxigvx_rDUKN7_EL2ly46zX85wLJ7mJc8ApUdLDtJZHH7T3rts-D31XNEQUC4UxU_FuvG_yg2DP4eXAOWqNXP5qfDW7upGaqbGBbBMAovbsLxzDgP6MfSaF9lcF5FEPEAEY7Ioc",
    badge: null,
  },
  {
    id: 8,
    name: "Foundation Full",
    price: 440,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlaEjjy-zCn8qRRRYh6AkbnNqkIdkzUhr8RT7D2a3eOCixyzGz9_FTmk2sapno9qUfRqYBiZRBp9HOspZ5QvvMLAsCKm0Uk5-qgUcL2glT_EWGklaYdwOhgIDs8kzauXStncK51uBfwPpFAoXbUdYWDIRCb-hi26esdLupT1ANu_aA0W0fV-DK7Gmf7Jn_PtGxF9epuZkNqRe11U6WovsPHr9fsXi0gFmiHTQdmfwBj3Pa4ehoN2-yjkF0OLjpksyee5Y3o_O_oGc",
    badge: null,
  },
];

// Mock data for components
const COMPONENTS = [
  { id: 1, name: "Ivory PBT Set", price: 85, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHlNO21wA8fimNEsyxE46agplEdBq4dmnhILplAKAdY7wvziHdPJknO4wsK8JH_qWT3EkQM1Ygp8FLHXN5Jr_TkNW3aKA7K9xtUHBbUdhTWqbdzVyhyo92F9Tg7DYmk7W8Rd1667cvtCTzz-2-cQCTeRyEwSMfFt5JuMjzEB93iv9IZ5jHtztwOfRhcY7Xd4I2fRSrz5BciH_potBs2bMdUd8ZLbvHz_9eXCYIHoNzSr_pl6s7qJRPQpHGG_e427qfCNKWpt6fBYA" },
  { id: 2, name: "Silver-Plated Linears", price: 45, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlaEjjy-zCn8qRRRYh6AkbnNqkIdkzUhr8RT7D2a3eOCixyzGz9_FTmk2sapno9qUfRqYBiZRBp9HOspZ5QvvMLAsCKm0Uk5-qgUcL2glT_EWGklaYdwOhgIDs8kzauXStncK51uBfwPpFAoXbUdYWDIRCb-hi26esdLupT1ANu_aA0W0fV-DK7Gmf7Jn_PtGxF9epuZkNqRe11U6WovsPHr9fsXi0gFmiHTQdmfwBj3Pa4ehoN2-yjkF0OLjpksyee5Y3o_O_oGc" },
  { id: 3, name: "Brass Weight Kit", price: 65, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGwFqMhJQ5oO8hK8HOIqKPWvw_w151n_iQ6qNPrfkAVP9cCl9IPDPhkvjhQ6DVTTCaKMPFW6IVhQxEDG0YFhcRVqSasySQW_NTVmQn-9ooH-uOouYUkP9VyRkZazfm2rS5sSNWTxigvx_rDUKN7_EL2ly46zX85wLJ7mJc8ApUdLDtJZHH7T3rts-D31XNEQUC4UxU_FuvG_yg2DP4eXAOWqNXP5qfDW7upGaqbGBbBMAovbsLxzDgP6MfSaF9lcF5FEPEAEY7Ioc" },
  { id: 4, name: "Lube Station", price: 35, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBz2neMSTD_YS6gHy8mUjCzDqGjzM4ELT7CUem-QwP6ypd5x5hOJFuIppAEc6C4B0WSnnddTcTyp758yVALM0PkRLQqIpHVPStHb5kcbaRr5xQmJ8NK4VOkDW1Gpqij68TtqFM5ZrpkDMwZW1-Ef6Q-rPfNrwwc8LOCwzdHwM06HUymaexBleyMktDybbdW2OabanXf8qF338yP3i3YiWanEd8dCjlpeqFqEOlATRHNhaeFFl0pm01Z-hmNKwIbYvyf9ydAhzSXy1g" },
  { id: 5, name: "FR4 Plate", price: 25, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoqaRPQrETFYzAuzX8nXryrc9vVGxIMKHxKrDGLWC8vbX5yC_fYIdOUsomo293UxcVHQvIBByZKlm6PO-KHZhyDtvIXsIWTUJ2HHM6iek3Ig1c4eVcnnFxSAOSrq21ALIKm_guwa_v5YauosQRRGkN5ILvYsvkwir1miLxB416IFZBhwu0UQDwoWb8a2hYj97YiVeLe_quy7GeMvy_b0aIXN4Ncn1RSMFlk65WvrROfb9qsrz8VwixLNgxkQGJGpTCmAaEhLBGUxM" },
  { id: 6, name: "Aviator Cable", price: 55, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBz2neMSTD_YS6gHy8mUjCzDqGjzM4ELT7CUem-QwP6ypd5x5hOJFuIppAEc6C4B0WSnnddTcTyp758yVALM0PkRLQqIpHVPStHb5kcbaRr5xQmJ8NK4VOkDW1Gpqij68TtqFM5ZrpkDMwZW1-Ef6Q-rPfNrwwc8LOCwzdHwM06HUymaexBleyMktDybbdW2OabanXf8qF338yP3i3YiWanEd8dCjlpeqFqEOlATRHNhaeFFl0pm01Z-hmNKwIbYvyf9ydAhzSXy1g" },
  { id: 7, name: "Felt Desk Mat", price: 40, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHlNO21wA8fimNEsyxE46agplEdBq4dmnhILplAKAdY7wvziHdPJknO4wsK8JH_qWT3EkQM1Ygp8FLHXN5Jr_TkNW3aKA7K9xtUHBbUdhTWqbdzVyhyo92F9Tg7DYmk7W8Rd1667cvtCTzz-2-cQCTeRyEwSMfFt5JuMjzEB93iv9IZ5jHtztwOfRhcY7Xd4I2fRSrz5BciH_potBs2bMdUd8ZLbvHz_9eXCYIHoNzSr_pl6s7qJRPQpHGG_e427qfCNKWpt6fBYA" },
  { id: 8, name: "Silent Tactiles", price: 50, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlaEjjy-zCn8qRRRYh6AkbnNqkIdkzUhr8RT7D2a3eOCixyzGz9_FTmk2sapno9qUfRqYBiZRBp9HOspZ5QvvMLAsCKm0Uk5-qgUcL2glT_EWGklaYdwOhgIDs8kzauXStncK51uBfwPpFAoXbUdYWDIRCb-hi26esdLupT1ANu_aA0W0fV-DK7Gmf7Jn_PtGxF9epuZkNqRe11U6WovsPHr9fsXi0gFmiHTQdmfwBj3Pa4ehoN2-yjkF0OLjpksyee5Y3o_O_oGc" },
];

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

  return (
    <>
      <TopNav />
      <main className="pt-20">
        {/* 1. Sliding Hero Banner */}
        <section className="layout-container">
          <div className="relative h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] overflow-hidden bg-surface-container-low rounded-xl mt-8">
            <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar">
              {/* Slide 1 */}
              <div className="flex-none w-full h-full snap-center relative">
                <img
                  alt="Hero Slide 1"
                  className="absolute inset-0 w-full h-full object-cover"
                  src="https://www.qwertykeys.com/cdn/shop/files/screenshot-20251226-174807.png?v=1766742598&width=1800"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center px-6 md:px-12 lg:px-24">
                  <div className="max-w-2xl text-on-primary">
                    <span className="font-label text-xs md:text-sm uppercase tracking-[0.2em] mb-4 block font-semibold">
                      Limited Release
                    </span>
                    <h2 className="font-headline text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                      Tactile Engineering. Editorial Art.
                    </h2>
                    <button className="px-8 py-4 bg-primary-container text-on-primary-container rounded-md font-semibold hover:scale-95 transition-transform">
                      Shop The Collection
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Slider Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div className="w-3 h-3 rounded-full bg-primary/30"></div>
              <div className="w-3 h-3 rounded-full bg-primary/30"></div>
            </div>
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
              {KEYBOARDS.map((kb) => (
                <div key={kb.id} className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-4 relative">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={kb.image}
                      alt={kb.name}
                    />
                    {kb.badge && (
                      <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 text-xs font-bold uppercase rounded">
                        {kb.badge}
                      </div>
                    )}
                  </div>
                  <h3 className="font-headline text-lg md:text-xl font-bold text-primary">
                    {kb.name}
                  </h3>
                  <p className="text-on-surface-variant font-medium">
                    ${kb.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Secondary Full-Width Banner */}
        <section className="w-full py-12">
          <div className="layout-container">
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoqaRPQrETFYzAuzX8nXryrc9vVGxIMKHxKrDGLWC8vbX5yC_fYIdOUsomo293UxcVHQvIBByZKlm6PO-KHZhyDtvIXsIWTUJ2HHM6iek3Ig1c4eVcnnFxSAOSrq21ALIKm_guwa_v5YauosQRRGkN5ILvYsvkwir1miLxB416IFZBhwu0UQDwoWb8a2hYj97YiVeLe_quy7GeMvy_b0aIXN4Ncn1RSMFlk65WvrROfb9qsrz8VwixLNgxkQGJGpTCmAaEhLBGUxM"
                alt="The Artisan Series"
              />
              <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center text-center p-6">
                <div className="max-w-3xl">
                  <h2 className="font-headline text-3xl md:text-5xl lg:text-6xl font-bold text-on-primary mb-6">
                    The Artisan Series 01
                  </h2>
                  <p className="text-base md:text-lg text-on-primary/90 mb-8 max-w-xl mx-auto">
                    A limited collaboration featuring hand-polished brass weights and
                    bespoke silver-plated switches.
                  </p>
                  <button className="bg-surface text-primary px-8 md:px-10 py-3 md:py-4 rounded-md font-bold hover:bg-secondary-fixed transition-colors">
                    Join the Waitlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

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
              {COMPONENTS.map((comp) => (
                <div key={comp.id} className="group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-surface-container-lowest mb-4">
                    <img
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      src={comp.image}
                      alt={comp.name}
                    />
                  </div>
                  <h4 className="font-bold text-primary text-sm md:text-base">{comp.name}</h4>
                  <p className="text-xs md:text-sm text-on-surface-variant">
                    ${comp.price.toFixed(2)}
                  </p>
                </div>
              ))}
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
