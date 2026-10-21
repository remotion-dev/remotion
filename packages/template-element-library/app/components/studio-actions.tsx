import {
  addElementLibraryToStudio,
  installInStudio,
  setStudioDragData,
} from "@remotion/studio-protocol";
import { PlusIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useRef, useState } from "react";
import type { CatalogEntry } from "../../lib/element-payload";
import { ElementUseButton } from "./element-use-button";
import { CaptionStyleButton } from "./caption-style-button";
import {
  StudioInstallFallback,
  type StudioFailure,
} from "./studio-install-fallback";

type Status =
  | { type: "idle" | "pending" | "success"; message: string }
  | ({ type: "error" } & StudioFailure);

export const StudioActions = (
  props:
    | {
        entry: CatalogEntry;
        variant: "card";
      }
    | {
        entry: CatalogEntry;
        variant: "caption";
        isSelected: boolean;
      }
    | {
        entry: CatalogEntry | null;
        variant: "default";
      },
) => {
  const { entry, variant } = props;
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [fallback, setFallback] = useState({ isOpen: false, failureCount: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const sendToStudio = async () => {
    setStatus({ type: "pending", message: "Finding Remotion Studio…" });

    try {
      const result = entry
        ? await installInStudio({ payload: entry.payload })
        : await addElementLibraryToStudio({
            url: new URL("/", window.location.origin).href,
            displayName: "Studio Supply",
            captionStylesUrl: new URL("/captions", window.location.origin).href,
          });

      if (result.success) {
        setStatus({
          type: "success",
          message:
            variant === "caption"
              ? "Caption style sent to Studio."
              : "Request sent. Confirm in Remotion Studio to finish.",
        });
        setFallback({ isOpen: false, failureCount: 0 });

        return;
      }

      setStatus({ type: "error", code: result.code, message: result.message });
    } catch {
      setStatus({
        type: "error",
        code: null,
        message:
          "Could not connect to Remotion Studio. Check that Studio is running, then try again.",
      });
    }

    setFallback((previous) => ({
      isOpen: true,
      failureCount: previous.failureCount + 1,
    }));
  };

  return (
    <div className="min-w-0">
      {props.variant === "caption" ? (
        <CaptionStyleButton
          entry={props.entry}
          isSelected={props.isSelected}
          loading={status.type === "pending"}
          onClick={sendToStudio}
          triggerRef={triggerRef}
        />
      ) : entry && variant === "default" ? (
        <ElementUseButton
          entry={entry}
          loading={status.type === "pending"}
          sent={status.type === "success"}
          onClick={sendToStudio}
          triggerRef={triggerRef}
        />
      ) : (
        <button
          ref={triggerRef}
          className={
            variant === "card"
              ? "pointer-events-auto relative inline-flex h-7.5 w-16 items-center justify-center rounded-md bg-white px-2.5 text-base font-medium text-ink shadow-sm ring-1 ring-black/10 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-busy:pointer-events-auto aria-busy:opacity-100 pointer-fine:pointer-events-none pointer-fine:opacity-0 pointer-fine:group-hover/card:pointer-events-auto pointer-fine:group-hover/card:opacity-100 pointer-fine:group-focus-within/card:pointer-events-auto pointer-fine:group-focus-within/card:opacity-100 sm:text-sm"
              : "relative inline-flex h-9 items-center justify-center gap-2 rounded-md bg-ink py-2 pr-3 pl-2 text-base font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm"
          }
          aria-label={
            variant === "card"
              ? status.type === "pending"
                ? `Sending ${entry.definition.displayName} to Studio`
                : status.type === "success"
                  ? `Sent ${entry.definition.displayName} to Studio`
                  : `Use ${entry.definition.displayName} in Studio`
              : undefined
          }
          title={
            variant === "card" && status.type === "success"
              ? status.message
              : undefined
          }
          type="button"
          disabled={status.type === "pending"}
          aria-busy={status.type === "pending"}
          draggable={entry !== null}
          onClick={sendToStudio}
          onDragStart={(event) => {
            if (!entry) return;
            setStudioDragData({
              dataTransfer: event.dataTransfer,
              payload: entry.payload,
            });
          }}
        >
          <span
            aria-hidden
            className="pointer-fine:hidden absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2"
          />
          {variant === "default" && (
            <PlusIcon className="size-4 shrink-0 fill-white" />
          )}
          <span className="relative">
            <span
              className={status.type === "pending" ? "invisible" : undefined}
              aria-hidden={status.type === "pending"}
            >
              {variant === "card"
                ? status.type === "success"
                  ? "Sent"
                  : "Use"
                : "Add library to Studio"}
            </span>
            {status.type === "pending" && (
              <span className="absolute inset-0">
                {variant === "card" ? "…" : "Connecting…"}
              </span>
            )}
          </span>
        </button>
      )}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={
          variant !== "default"
            ? "sr-only"
            : "fixed inset-x-4 bottom-4 z-50 text-base/7 sm:right-6 sm:bottom-6 sm:left-auto sm:w-96 sm:text-sm/6"
        }
      >
        {!fallback.isOpen && status.type !== "error" && status.message && (
          <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/10">
            <div className="min-w-0 flex-1 text-pretty wrap-anywhere">
              <p>{status.message}</p>
            </div>
            {status.type !== "pending" && variant === "default" && (
              <button
                type="button"
                aria-label="Dismiss notification"
                className="relative flex size-7.5 shrink-0 items-center justify-center rounded-md hover:bg-neutral-100"
                onClick={() => setStatus({ type: "idle", message: "" })}
              >
                <XMarkIcon className="size-4 shrink-0 fill-muted" />
                <span
                  aria-hidden
                  className="pointer-fine:hidden absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2"
                />
              </button>
            )}
          </div>
        )}
      </div>
      {fallback.isOpen && (
        <StudioInstallFallback
          entry={entry}
          failure={status.type === "error" ? status : null}
          failureCount={fallback.failureCount}
          isPending={status.type === "pending"}
          onRetry={sendToStudio}
          onClose={() => {
            setFallback({ isOpen: false, failureCount: 0 });

            if (status.type === "error")
              setStatus({ type: "idle", message: "" });
          }}
          triggerRef={triggerRef}
        />
      )}
    </div>
  );
};
