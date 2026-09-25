import ReactRefreshRuntime from "react-refresh/runtime";
import type { CreatePreviewHost } from "./bridge";

// The React Refresh hook must be installed before React DOM is evaluated,
// which is why the runtime is imported lazily.
ReactRefreshRuntime.injectIntoGlobalHook(globalThis);

const initialize: Promise<CreatePreviewHost> = import("./runtime").then(
  ({ createPreviewHost }) => createPreviewHost,
);

window.remotionVibeCodePreview = initialize;

void initialize.catch((error: unknown) => {
  const message = document.createElement("p");
  message.setAttribute("role", "alert");
  message.style.cssText = "color:#fca5a5;font:13px sans-serif;padding:16px";
  message.textContent = `Could not load the preview: ${
    error instanceof Error ? error.message : String(error)
  }`;
  document.body.replaceChildren(message);
});
