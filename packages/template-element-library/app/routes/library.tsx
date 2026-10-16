import { useOutletContext, type MetaFunction } from "react-router";
import { CategoryNavigation } from "../components/category-navigation";
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
  const { search } = useOutletContext<{ search: string }>();
  const searchParams = new URLSearchParams(search);

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
        <CategoryNavigation category={category} />
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
