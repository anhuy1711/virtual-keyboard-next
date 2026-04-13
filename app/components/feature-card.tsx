type FeatureCardProps = {
  title: string;
  description: string;
  icon?: string;
};

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {icon && <div className="mb-3 text-2xl">{icon}</div>}
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </article>
  );
}
