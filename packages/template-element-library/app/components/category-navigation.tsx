import { Link, useOutletContext } from "react-router";
import { elements } from "../../elements/registry";

export const CategoryNavigation = ({
  category,
}: {
  category: string | null;
}) => {
  const { search } = useOutletContext<{ search: string }>();
  const categories = [...new Set(elements.map((element) => element.category))];

  return (
    <nav
      className="flex min-w-0 gap-6 overflow-x-auto text-base sm:text-sm"
      aria-label="Filter by category"
    >
      {[null, ...categories].map((item) => {
        const params = new URLSearchParams(search);

        if (item === null || item === "Captions") {
          params.delete("category");
        } else {
          params.set("category", item.toLowerCase());
        }

        return (
          <Link
            key={item ?? "all"}
            to={{
              pathname: item === "Captions" ? "/captions" : "/",
              search: params.toString(),
            }}
            preventScrollReset
            className="shrink-0 border-b-2 border-transparent py-4 font-medium whitespace-nowrap text-muted hover:text-ink focus-visible:-outline-offset-4 aria-[current=page]:border-ink aria-[current=page]:text-ink"
            aria-current={category === item ? "page" : undefined}
          >
            {item ?? "All"}
          </Link>
        );
      })}
    </nav>
  );
};
