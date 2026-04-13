type FeaturedCollectionsProps = {
  title?: string;
  subtitle?: string;
  shopAllLink?: string;
  items: {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    imageAlt: string;
    isLarge?: boolean;
  }[];
};

export default function FeaturedCollections({
  title = "The Essentials",
  subtitle = "Precision components for your next build.",
  shopAllLink = "#",
  items,
}: FeaturedCollectionsProps) {
  return (
    <section className="py-24 bg-surface-container-low dark:bg-surface-container">
      <div className="container mx-auto px-12">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-headline text-4xl font-bold text-primary dark:text-primary-fixed tracking-tight">
              {title}
            </h2>
            <p className="font-body text-on-surface-variant dark:text-on-surface-variant mt-2">
              {subtitle}
            </p>
          </div>
          <a
            href={shopAllLink}
            className="font-label font-bold text-sm uppercase tracking-widest text-primary dark:text-primary-fixed border-b-2 border-primary/20 dark:border-primary-fixed/20 hover:border-primary dark:hover:border-primary-fixed transition-all pb-1"
          >
            Shop All Collections
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-[700px]">
          {/* Large Card */}
          {items[0] && (
            <div className="md:col-span-8 bg-surface-container-lowest dark:bg-surface-container-low rounded-xl overflow-hidden relative group">
              <img
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={items[0].imageUrl}
                alt={items[0].imageAlt}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-on-primary">
                <span className="font-label text-xs uppercase tracking-[0.3em] mb-2 block opacity-80">
                  {items[0].subtitle}
                </span>
                <h3 className="text-3xl font-headline font-bold mb-4">
                  {items[0].title}
                </h3>
                <button className="font-label text-sm uppercase tracking-widest font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Explore Kits{" "}
                  <span className="material-symbols-outlined">east</span>
                </button>
              </div>
            </div>
          )}

          {/* Side Stack */}
          <div className="md:col-span-4 grid grid-rows-2 gap-8">
            {items.slice(1, 3).map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl overflow-hidden relative group"
              >
                <img
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={item.imageUrl}
                  alt={item.imageAlt}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-6 left-6 text-on-primary">
                  <h3 className="text-xl font-headline font-bold">
                    {item.title}
                  </h3>
                  <span className="text-sm font-body opacity-90">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

