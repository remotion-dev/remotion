import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { startTransition } from "react";

const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/convert/service-worker.js")
        .catch((error) => {
          console.log("SW registration failed:", error);
        });
    });
  }
};

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
  registerServiceWorker();
});