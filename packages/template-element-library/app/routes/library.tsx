import { useState } from "react";
import type { MetaFunction } from "react-router";
import { catalog } from "../../lib/element-payload";
import { libraryConfig } from "../../lib/library-config";
import { ElementCard } from "../components/element-card";

export const meta: MetaFunction = () => [
  { title: `${libraryConfig.name} — Remotion Elements` },
  { name: "description", content: libraryConfig.description },
];

export default function Library() {
  const [category, setCategory] = useState<string | null>(null);
  const categories = [
    ...new Set(catalog.map(({ definition }) => definition.category)),
  ];
  const visible = catalog.filter(
    ({ definition }) => category === null || definition.category === category,
  );

  return (
    <main id="main" className="pt-6 pb-12">
      <h1 className="sr-only">Elements</h1>
      <section aria-label="Elements">
        <div className="flex min-w-0 items-center justify-between gap-6 border-b border-neutral-950/10">
          <div
            className="flex min-w-0 gap-6 overflow-x-auto"
            role="group"
            aria-label="Filter by category"
          >
            {[null, ...categories].map((item) => (
              <button
                key={item ?? "all"}
                type="button"
                className="shrink-0 border-b-2 border-transparent py-4 text-base font-medium whitespace-nowrap text-muted hover:text-ink focus-visible:-outline-offset-4 aria-pressed:border-ink aria-pressed:text-ink sm:text-sm"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item ?? "All"}
              </button>
            ))}
          </div>
          <p
            role="status"
            className="shrink-0 text-sm whitespace-nowrap text-muted tabular-nums max-sm:sr-only"
          >
            {visible.length} {visible.length === 1 ? "element" : "elements"}
          </p>
        </div>
        <ul
          role="list"
          className="grid grid-cols-1 gap-x-6 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((entry) => (
            <ElementCard key={entry.definition.slug} entry={entry} />
          ))}
        </ul>
      </section>
    </main>
  );
}
