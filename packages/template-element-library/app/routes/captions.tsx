import { subscribeToCaptionStyleSelection } from "@remotion/studio-protocol";
import { useEffect, useState } from "react";
import { useOutletContext, type MetaFunction } from "react-router";
import { catalog } from "../../lib/element-payload";
import { CategoryNavigation } from "../components/category-navigation";
import { ElementCard } from "../components/element-card";
import { StudioActions } from "../components/studio-actions";

export const meta: MetaFunction = () => [
  { title: "Caption styles — Studio Supply" },
  {
    name: "description",
    content: "Editable caption styles for your Remotion videos.",
  },
];

export default function Captions() {
  const { isCaptionPicker } = useOutletContext<{ isCaptionPicker: boolean }>();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => subscribeToCaptionStyleSelection(setSelectedSlug), []);

  return (
    <main
      id="main"
      className="pt-6 pb-12 group-data-[caption-picker=true]/site:py-3"
    >
      <h1 className="sr-only">Caption styles</h1>
      {!isCaptionPicker && <CategoryNavigation category="Captions" />}
      <ul
        role="list"
        aria-label="Caption styles"
        className={
          isCaptionPicker
            ? "grid grid-cols-[repeat(auto-fill,minmax(min(100%,11rem),1fr))] gap-3"
            : "grid grid-cols-1 gap-x-6 gap-y-10 pt-6 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {catalog
          .filter(({ definition }) => definition.category === "Captions")
          .map((entry) =>
            isCaptionPicker ? (
              <li key={entry.definition.slug} className="min-w-0">
                <StudioActions
                  entry={entry}
                  variant="caption"
                  isSelected={selectedSlug === entry.definition.slug}
                />
              </li>
            ) : (
              <ElementCard key={entry.definition.slug} entry={entry} />
            ),
          )}
      </ul>
    </main>
  );
}
