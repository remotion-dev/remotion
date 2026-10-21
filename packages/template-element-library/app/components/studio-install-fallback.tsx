import { XMarkIcon } from "@heroicons/react/16/solid";
import {
  setStudioDragData,
  type AddElementLibraryToStudioErrorCode,
  type InstallInStudioErrorCode,
} from "@remotion/studio-protocol";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { CatalogEntry } from "../../lib/element-payload";

export type StudioFailure = {
  code: AddElementLibraryToStudioErrorCode | InstallInStudioErrorCode | null;
  message: string;
};

export const StudioInstallFallback = ({
  entry,
  failure,
  failureCount,
  isPending,
  onRetry,
  onClose,
  triggerRef,
}: {
  entry: CatalogEntry | null;
  failure: StudioFailure | null;
  failureCount: number;
  isPending: boolean;
  onRetry: () => void;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [copyStatus, setCopyStatus] = useState("");
  const libraryUrl = new URL("/", window.location.origin).href;

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = triggerRef.current;

    if (!dialog) return;
    dialog.showModal();

    return () => {
      dialog.close();
      window.requestAnimationFrame(() => {
        if (trigger?.isConnected && !dialog.open) trigger.focus();
      });
    };
  }, [triggerRef]);

  useEffect(() => {
    if (copyStatus !== "Copied.") return;
    const timeout = window.setTimeout(() => setCopyStatus(""), 2000);

    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="scheme-light m-auto max-h-[calc(100dvh_-_--spacing(8))] w-[calc(100%_-_--spacing(8))] max-w-lg overflow-y-auto rounded-xl bg-white p-6 text-base/7 text-ink shadow-xl ring-1 ring-black/10 backdrop:bg-black/30 sm:text-sm/6"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();

        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="min-w-0 text-xl font-semibold text-balance">
          {entry ? "Use this Element" : "Add Studio Supply to Studio"}
        </h2>
        <button
          type="button"
          aria-label="Close installation help"
          className="relative flex size-7.5 shrink-0 items-center justify-center rounded-md hover:bg-neutral-100"
          onClick={onClose}
        >
          <XMarkIcon className="size-4 shrink-0 fill-muted" />
          <span
            aria-hidden
            className="pointer-fine:hidden absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2"
          />
        </button>
      </div>
      <div
        aria-live="polite"
        className="mt-4 text-pretty wrap-anywhere text-muted [&_a]:underline [&_a]:underline-offset-4"
      >
        {isPending ? (
          <p>Finding a compatible Remotion Studio…</p>
        ) : failure?.code === "no-compatible-studio" ? (
          <p>
            Remotion Studio is the video editor for your Remotion project. Open
            an existing project or{" "}
            <a
              href="https://www.remotion.dev/docs/"
              target="_blank"
              rel="noreferrer"
            >
              create your first Remotion project
            </a>
            , and{" "}
            <a
              href="https://www.remotion.dev/docs/studio"
              target="_blank"
              rel="noreferrer"
            >
              install and open Remotion Studio
            </a>
            . Once Studio is running, return here and try again.
          </p>
        ) : failure?.code === "no-installable-target" ? (
          <p>
            Open your video in{" "}
            <a
              href="https://www.remotion.dev/docs/studio"
              target="_blank"
              rel="noreferrer"
            >
              Remotion Studio
            </a>
            , select where you want to insert the Element, then try again.{" "}
            <a
              href="https://www.remotion.dev/docs/studio/browse-elements"
              target="_blank"
              rel="noreferrer"
            >
              Learn how to add Elements to your video.
            </a>
          </p>
        ) : failure?.code === "no-configurable-target" ? (
          <p>
            <a
              href="https://www.remotion.dev/docs/studio"
              target="_blank"
              rel="noreferrer"
            >
              Open Remotion Studio
            </a>{" "}
            for your local project and switch to its browser tab, then try
            again.
          </p>
        ) : failure?.code === "studio-upgrade-required" ? (
          <p>
            {failure.message}{" "}
            <a
              href="https://www.remotion.dev/docs/upgrading"
              target="_blank"
              rel="noreferrer"
            >
              How to upgrade Remotion.
            </a>
          </p>
        ) : (
          <p>{failure?.message}</p>
        )}
      </div>
      <button
        type="button"
        disabled={isPending}
        aria-busy={isPending}
        draggable={entry !== null && !isPending}
        onDragStart={(event) => {
          if (entry)
            setStudioDragData({
              dataTransfer: event.dataTransfer,
              payload: entry.payload,
            });
        }}
        onClick={onRetry}
        className="relative mt-5 inline-flex h-9 items-center justify-center rounded-md bg-ink px-3 text-base font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm"
      >
        <span
          aria-hidden
          className="pointer-fine:hidden absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2"
        />
        {isPending ? "Connecting…" : "Try again"}
      </button>
      {entry ? (
        <>
          <p className="mt-4 text-pretty text-muted">
            {failureCount > 1
              ? "Still not connecting? Drag the button above into your Studio instead."
              : "You can also drag the button above into your Studio."}
          </p>
          <p className="mt-4 text-pretty text-muted">
            Or copy the source code and create a new TSX file in your project.
          </p>
          <button
            type="button"
            className="relative mt-3 inline-flex h-9 items-center rounded-md border border-neutral-950/15 px-3 font-medium hover:bg-neutral-50"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(entry.sourceCode);
                setCopyStatus("Copied.");
              } catch {
                setCopyStatus(
                  "Could not copy. Open the Element’s page and select the code under View source.",
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
        </>
      ) : (
        <div className="mt-6 border-t border-neutral-950/10 pt-5">
          <h3 className="text-base font-medium text-balance sm:text-sm">
            Add manually
          </h3>
          <p className="mt-2 text-pretty text-muted">
            In your local Studio, open{" "}
            <strong className="font-medium text-ink">Settings</strong>, select{" "}
            <strong className="font-medium text-ink">Elements</strong>, then
            choose <strong className="font-medium text-ink">Add by URL</strong>{" "}
            and paste this URL:
          </p>
          <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              name="library-url"
              aria-label="Library URL"
              readOnly
              value={libraryUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="w-full min-w-0 rounded-md border border-neutral-950/15 px-3 py-2 font-mono focus-visible:-outline-offset-1 sm:flex-1"
            />
            <button
              type="button"
              className="relative inline-flex h-9 shrink-0 items-center rounded-md border border-neutral-950/15 px-3 font-medium hover:bg-neutral-50"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(libraryUrl);
                  setCopyStatus("Copied.");
                } catch {
                  setCopyStatus(
                    "Could not copy. Select the URL above and copy it manually.",
                  );
                }
              }}
            >
              <span
                aria-hidden
                className="pointer-fine:hidden absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2"
              />
              Copy URL
            </button>
          </div>
          <p className="mt-3 text-pretty text-muted">
            Then click{" "}
            <strong className="font-medium text-ink">
              + Add Element Library
            </strong>{" "}
            in Studio.
          </p>
          <p className="mt-3 text-pretty text-muted">
            You can also add this URL to <code>remotion.config.ts</code> using{" "}
            <a
              className="underline underline-offset-4"
              href="https://www.remotion.dev/docs/config#addelementlibrary"
              target="_blank"
              rel="noreferrer"
            >
              <code>Config.addElementLibrary()</code>
            </a>
            . To include caption styles, also set <code>captionStylesUrl</code>{" "}
            to{" "}
            <code className="break-all">
              {new URL("/captions", window.location.origin).href}
            </code>
            .
          </p>
        </div>
      )}
      <p
        role="status"
        className="mt-3 text-pretty wrap-anywhere text-muted empty:hidden"
      >
        {copyStatus}
      </p>
      <nav
        aria-label="Remotion Studio guides"
        className="mt-6 border-t border-neutral-950/10 pt-5"
      >
        <h3 className="text-base font-medium text-balance sm:text-sm">
          Learn Remotion Studio
        </h3>
        <ul
          role="list"
          className="mt-2 space-y-2 text-muted [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-ink"
        >
          <li>
            <a
              href="https://www.remotion.dev/docs/studio/browse-elements"
              target="_blank"
              rel="noreferrer"
            >
              Browse Elements and add libraries
            </a>
          </li>
          <li>
            <a
              href="https://www.remotion.dev/docs/studio/interactivity"
              target="_blank"
              rel="noreferrer"
            >
              Edit Elements in the preview and timeline
            </a>
          </li>
        </ul>
      </nav>
    </dialog>,
    document.body,
  );
};
