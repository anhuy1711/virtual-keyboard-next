type HeroSectionProps = {
  label?: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
};

export default function HeroSection({
  label = "Collection 01 / The Foundation",
  title,
  description,
  imageUrl,
  imageAlt,
  primaryButtonText = "Explore the Atelier",
  secondaryButtonText = "View Journal",
  onPrimaryClick,
  onSecondaryClick,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen pt-20 flex items-center overflow-hidden bg-surface dark:bg-inverse-surface">
      <div className="container mx-auto px-12 grid md:grid-cols-2 gap-16 items-center">
        <div className="z-10">
          <span className="font-label text-sm uppercase tracking-[0.2em] text-secondary font-semibold mb-6 block">
            {label}
          </span>
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary dark:text-primary-fixed leading-[1.1] tracking-tighter mb-8">
            {title}
          </h1>
          <p className="font-body text-lg text-on-surface-variant dark:text-on-surface-variant max-w-md mb-10 leading-relaxed">
            {description}
          </p>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={onPrimaryClick}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-md font-semibold hover:scale-95 transition-transform"
            >
              {primaryButtonText}
            </button>
            <button
              onClick={onSecondaryClick}
              className="px-8 py-4 bg-surface-container-high dark:bg-surface-container text-primary rounded-md font-semibold hover:bg-surface-container-highest dark:hover:bg-surface-container-high transition-colors"
            >
              {secondaryButtonText}
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
          <div className="relative rounded-xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
            <img
              alt={imageAlt}
              className="w-full h-[600px] object-cover"
              src={imageUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

