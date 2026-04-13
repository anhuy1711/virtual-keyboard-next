type SpecItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

type SpecGridProps = {
  items: SpecItem[];
};

export default function SpecGrid({ items }: SpecGridProps) {
  return (
    <section className="py-24 bg-surface-container-low dark:bg-surface-container border-t border-outline-variant/15 dark:border-outline-variant/10">
      <div className="container mx-auto px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        {items.map((item) => (
          <div
            key={item.id}
            className="text-center md:text-left"
          >
            <span className="material-symbols-outlined text-secondary dark:text-secondary-fixed text-4xl mb-4 block">
              {item.icon}
            </span>
            <h4 className="font-headline font-bold text-primary dark:text-primary-fixed mb-2">
              {item.title}
            </h4>
            <p className="text-sm text-on-surface-variant dark:text-on-surface-variant font-body">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

