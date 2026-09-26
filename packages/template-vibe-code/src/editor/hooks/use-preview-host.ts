"use client";

import { useEffect, useRef, useState } from "react";
import type { PreviewHost, PreviewKeyEvent } from "@/preview/bridge";

export const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Loads /preview.html into the iframe and connects to the preview host that
 * the iframe exposes on its window.
 */
export const usePreviewHost = ({
  iframeRef,
  onError,
  onKeyDown,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onError: (message: string) => void;
  onKeyDown: (event: PreviewKeyEvent) => boolean;
}) => {
  const [host, setHost] = useState<PreviewHost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  const onKeyDownRef = useRef(onKeyDown);
  onErrorRef.current = onError;
  onKeyDownRef.current = onKeyDown;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    let disposed = false;
    let loaded = false;
    let created: PreviewHost | null = null;
    const timeout = window.setTimeout(() => {
      if (!disposed && !created) {
        setError(
          "Timed out while loading the preview. Run `npm run build-preview` and reload the page.",
        );
      }
    }, 30_000);

    const onLoad = () => {
      if (disposed || iframe.contentWindow?.location.href === "about:blank") {
        return;
      }

      if (loaded) {
        setError("The preview reloaded. Reload this page to reconnect.");
        return;
      }

      loaded = true;
      const initialize = iframe.contentWindow?.remotionVibeCodePreview;
      if (!initialize) {
        setError(
          "The preview bundle is missing. Run `npm run build-preview` and reload the page.",
        );
        return;
      }

      initialize
        .then((createPreviewHost) => {
          if (disposed) {
            return;
          }

          created = createPreviewHost({
            onError: (message) => onErrorRef.current(message),
            onKeyDown: (event) => onKeyDownRef.current(event),
          });
          window.clearTimeout(timeout);
          setHost(created);
        })
        .catch((err: unknown) => {
          if (!disposed) {
            setError(getErrorMessage(err));
          }
        });
    };

    const onIframeError = () => {
      if (!disposed) {
        setError("The preview iframe failed to load.");
      }
    };

    iframe.addEventListener("load", onLoad);
    iframe.addEventListener("error", onIframeError);
    iframe.src = "/preview.html";

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      iframe.removeEventListener("load", onLoad);
      iframe.removeEventListener("error", onIframeError);
      created?.dispose();
      setHost(null);
      iframe.src = "about:blank";
    };
  }, [iframeRef]);

  return { host, error };
};
