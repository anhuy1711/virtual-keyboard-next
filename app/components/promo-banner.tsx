type PromoBannerProps = {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  buttonText?: string;
  onButtonClick?: () => void;
};

export default function PromoBanner({
  title,
  description,
  imageUrl,
  imageAlt,
  buttonText = "Join the Waitlist",
  onButtonClick,
}: PromoBannerProps) {
  return (
    <section className="py-24 bg-surface dark:bg-inverse-surface">
      <div className="container mx-auto px-12">
        <div className="bg-accent-container dark:bg-primary rounded-2xl overflow-hidden relative flex items-center p-16 min-h-[400px]">
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-30 mix-blend-overlay">
            <img
              className="w-full h-full object-cover"
              src={imageUrl}
              alt={imageAlt}
            />
          </div>

          <div className="relative z-10 max-w-xl">
            <h2 className="font-headline text-5xl font-bold text-primary mb-6">
              {title}
            </h2>
            <p className="font-body text-on-accent-container dark:text-surface text-lg mb-10 leading-relaxed">
              {description}
            </p>
            <button
              onClick={onButtonClick}
              className="bg-accent dark:bg-inverse-surface text-on-accent dark:text-primary px-10 py-4 rounded-md font-bold hover:bg-accent-hover dark:hover:bg-surface-container transition-colors"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

