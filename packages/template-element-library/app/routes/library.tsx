import { Link, useSearchParams, type MetaFunction } from "react-router";
import { catalog } from "../../lib/element-payload";
import { ElementCard } from "../components/element-card";

export const meta: MetaFunction = () => [
  { title: "Studio Supply — Remotion Elements" },
  {
    name: "description",
    content:
      "Animations for your Remotion projects. Preview, install, and edit the source.",
  },
];

export default function Library() {
  const [searchParams] = useSearchParams();
  const categories = [
    ...new Set(catalog.map(({ definition }) => definition.category)),
  ];
  const category =
    categories.find(
      (item) => item.toLowerCase() === searchParams.get("category"),
    ) ?? null;
  const visible = catalog.filter(
    ({ definition }) => category === null || definition.category === category,
  );

  return (
    <main id="main" className="pt-6 pb-12">
      <h1 className="sr-only">Elements</h1>
      <section aria-label="Elements">
        <div className="flex min-w-0 items-center justify-between gap-6">
          <nav
            className="flex min-w-0 gap-6 overflow-x-auto text-base sm:text-sm"
            aria-label="Filter by category"
          >
            {[null, ...categories].map((item) => {
              const params = new URLSearchParams(searchParams);
              if (item === null) {
                params.delete("category");
              } else {
                params.set("category", item.toLowerCase());
              }

              return (
                <Link
                  key={item ?? "all"}
                  to={{ pathname: "/", search: params.toString() }}
                  preventScrollReset
                  className="shrink-0 border-b-2 border-transparent py-4 font-medium whitespace-nowrap text-muted hover:text-ink focus-visible:-outline-offset-4 aria-[current=page]:border-ink aria-[current=page]:text-ink"
                  aria-current={category === item ? "page" : undefined}
                >
                  {item ?? "All"}
                </Link>
              );
            })}
          </nav>
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
