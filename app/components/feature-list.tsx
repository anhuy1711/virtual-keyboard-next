import FeatureCard from "@/app/components/feature-card";

type Feature = {
  title: string;
  description: string;
  icon?: string;
};

type FeatureListProps = {
  items: Feature[];
};

export default function FeatureList({ items }: FeatureListProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <FeatureCard 
          key={item.title} 
          title={item.title} 
          description={item.description}
          icon={item.icon}
        />
      ))}
    </section>
  );
}
