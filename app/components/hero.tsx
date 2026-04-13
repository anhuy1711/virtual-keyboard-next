type HeroProps = {
  title: string;
  description: string;
};

export default function Hero({ title, description }: HeroProps) {
  return (
    <section className="space-y-4">
      <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
        Next.js 16 + Tailwind Base
      </span>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-300 sm:text-lg">
        {description}
      </p>
    </section>
  );
}
