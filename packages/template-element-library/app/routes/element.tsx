import { ArrowLeftIcon, ChevronDownIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import {
  Link,
  useOutletContext,
  useParams,
  type MetaFunction,
} from "react-router";
import { catalog } from "../../lib/element-payload";
import { ElementPreview } from "../components/element-preview";
import { StudioActions } from "../components/studio-actions";

export const meta: MetaFunction = ({ params }) => {
  const entry = catalog.find(
    ({ definition }) => definition.slug === params.slug,
  );

  return [
    {
      title: `${entry?.definition.displayName ?? "Element not found"} — Studio Supply`,
    },
    {
      name: "description",
      content: entry?.definition.description ?? "Browse the Element library.",
    },
    ...(entry
      ? [
          {
            tagName: "link" as const,
            rel: "alternate",
            type: "text/markdown",
            href: `/elements/${entry.definition.slug}.md`,
            title: `${entry.definition.displayName} as Markdown`,
          },
        ]
      : []),
  ];
};

export default function ElementPage() {
  const { slug } = useParams();
  const { search } = useOutletContext<{ search: string }>();
  const [copyStatus, setCopyStatus] = useState("");
  const entry = catalog.find(({ definition }) => definition.slug === slug);

  if (!entry) {
    return (
      <main id="main" className="py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Element not found
        </h1>
        <p className="mt-4 text-base text-pretty text-muted">
          Choose another Element from the library.
        </p>
        <p className="mt-6 text-base sm:text-sm">
          <Link
            className="underline underline-offset-4 hover:text-accent"
            to={{ pathname: "/", search }}
          >
            Back to the library
          </Link>
        </p>
      </main>
    );
  }

  const { definition, sourceCode } = entry;

  return (
    <main id="main" className="min-w-0 pt-8 pb-12">
      <div className="text-base sm:text-sm">
        <Link
          className="inline-flex min-h-12 items-center gap-2 text-muted hover:text-ink sm:min-h-9"
          to={{
            pathname: definition.category === "Captions" ? "/captions" : "/",
            search,
          }}
        >
          <ArrowLeftIcon className="size-4 shrink-0 fill-current" />
          {definition.category === "Captions" ? "All captions" : "All elements"}
        </Link>
      </div>
      <div className="pt-6 pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {definition.displayName}
        </h1>
        <p className="mt-3 max-w-[56ch] text-base text-pretty text-muted">
          {definition.description}
        </p>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div
          className={`min-w-0 overflow-hidden rounded-[min(1vw,8px)] outline-1 -outline-offset-1 outline-black/5 ${definition.previewBackground === "transparent" ? "transparency-grid" : ""}`}
        >
          <ElementPreview key={slug} definition={definition} />
        </div>
        <aside aria-label="Element details" className="min-w-0">
          <StudioActions key={slug} entry={entry} variant="default" />
          <dl className="mt-6 text-base sm:text-sm [&>div]:flex [&>div]:justify-between [&>div]:gap-4 [&>div]:py-3 [&>div:first-child]:pt-0 [&>div:last-child]:pb-0 [&_dt]:font-medium [&_dd]:text-right [&_dd]:text-muted">
            <div>
              <dt>Duration</dt>
              <dd className="tabular-nums">
                {definition.durationInFrames / definition.fps}s ·{" "}
                {definition.fps} fps
              </dd>
            </div>
            <div>
              <dt>Dimensions</dt>
              <dd className="tabular-nums">
                {definition.dimensions
                  ? `${definition.dimensions.width} × ${definition.dimensions.height}`
                  : "Fills composition"}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
      <details
        key={slug}
        className="group/source mt-10 min-w-0 border-y border-neutral-950/10"
      >
        <summary className="flex min-h-14 list-none items-center justify-between gap-4 py-4 text-base font-medium hover:text-accent sm:text-sm [&::-webkit-details-marker]:hidden">
          View source
          <ChevronDownIcon className="size-4 shrink-0 fill-current group-open/source:rotate-180" />
        </summary>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-950/10 py-4 text-base sm:text-sm">
          <p className="min-w-0 break-all font-mono text-muted">
            {definition.slug}.tsx
          </p>
          <button
            className="relative inline-flex h-9 shrink-0 items-center rounded-md border border-neutral-950/15 px-3 font-medium hover:bg-neutral-50"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(sourceCode);
                setCopyStatus("Source copied.");
              } catch {
                setCopyStatus(
                  "Could not copy. Select and copy the source below.",
                );
              }
            }}
          >
            <span
              aria-hidden
              className="pointer-fine:hidden absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2"
            />
            Copy source
          </button>
          <p
            role="status"
            className="w-full text-pretty text-muted empty:hidden"
          >
            {copyStatus}
          </p>
        </div>
        <pre
          tabIndex={0}
          aria-label="Element source code"
          className="mb-4 max-h-140 overflow-auto rounded-md bg-neutral-950 p-5 text-base/7 text-neutral-100 sm:text-sm/6"
        >
          <code>{sourceCode}</code>
        </pre>
      </details>
    </main>
  );
}
