"use client";

import { useRef } from "react";
import TopNav from "@/app/components/top-nav";
import HeroSection from "@/app/components/hero-section";
import FeaturedCollections from "@/app/components/featured-collections";
import PromoBanner from "@/app/components/promo-banner";
import SpecGrid from "@/app/components/spec-grid";
import Footer from "@/app/components/footer";

const collectionItems = [
  {
    id: "keyboards",
    title: "Bàn Phím",
    subtitle: "Custom Kits",
    imageUrl:
      "https://kbdfans.com/cdn/shop/files/1_d5d93dec-641b-4044-b483-61cd94b5f460_720x.jpg?v=1719372260",
    imageAlt: "CNC machined aluminum keyboard kit",
    isLarge: true,
  },
  {
    id: "keycaps",
    title: "Keycaps",
    subtitle: "Artisan PBT Sets",
    imageUrl:
      "https://kbdfans.com/cdn/shop/files/0__G3_Colors_-_Showcase_720x.png?v=1761530948",
    imageAlt: "Artisan keycaps",
  },
  {
    id: "switches",
    title: "Switches",
    subtitle: "Linear & Tactile",
    imageUrl:
      "https://kbdfans.com/cdn/shop/files/9_45249e07-bb68-4b3a-8ec4-3501a0c33d2e_720x.jpg?v=1706688074",
    imageAlt: "Mechanical switches",
  },
];

const specItems = [
  {
    id: "cnc-machined",
    icon: "precision_manufacturing",
    title: "CNC Machined",
    description:
      "Crafted from aerospace-grade aluminum blocks for zero-flex stability.",
  },
  {
    id: "pvd-coating",
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
  const collectionsRef = useRef<HTMLDivElement>(null);

  const scrollToCollections = () => {
    collectionsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <TopNav />
      <main className="pt-20">
        {/* Hero Section */}
        <HeroSection
          label="Collection 01 / The Foundation"
          title="Tactile Engineering. Editorial Art."
          description="A curated sanctuary for the mechanical keyboard enthusiast. Where precision machining meets timeless aesthetic design."
          imageUrl="https://kbdfans.com/cdn/shop/files/2d39c5ec40b597b4fa9ff6d8be57cf30_b87de752-8a95-4ae4-bfcc-681ab38d8846_720x.jpg?v=1744360106"
          imageAlt="Luxury Custom Keyboard"
          primaryButtonText="Virtual Keyboard"
          secondaryButtonText="View Journal"
          onPrimaryClick={scrollToCollections}
        />

        {/* Featured Collections */}
        <div ref={collectionsRef}>
          <FeaturedCollections
            title="DEMO"
            subtitle="demo"
            shopAllLink="/mechanical-keyboard"
            items={collectionItems}
          />
        </div>

        {/* Promo Banner */}
        <PromoBanner
          title="The Artisan Series 01"
          description="A limited collaboration featuring hand-polished brass weights and bespoke silver-plated switches. Available for pre-order exclusively to Atelier members."
          imageUrl="https://kbdfans.com/cdn/shop/files/1_0a376802-a688-4a24-afe6-cd4ee7a0c2b2_720x.jpg?v=1721702687"
          imageAlt="Keyboard artisan work"
          buttonText="Join the Waitlist"
        />

        {/* Spec Grid */}
        <SpecGrid items={specItems} />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
