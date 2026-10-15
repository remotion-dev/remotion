import { isInsideStudio } from "@remotion/studio-protocol";
import { useEffect, useState, type ReactNode } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from "react-router";
import { libraryConfig } from "../lib/library-config";
import { StudioActions } from "./components/studio-actions";
import "./app.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [insideStudio, setInsideStudio] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const location = useLocation();
  // Prerendered HTML has no query string. Add Studio context to links only
  // after hydration, then preserve it on every client-side navigation.
  const search = hydrated ? location.search : "";
  useEffect(() => {
    setInsideStudio(isInsideStudio());
    setHydrated(true);
  }, []);

  return (
    <div
      data-embedded={insideStudio}
      className="group/site isolate flex min-h-dvh flex-col"
    >
      <a
        className="absolute -top-24 left-6 z-50 bg-white p-3 focus:top-3"
        href="#main"
      >
        Skip to content
      </a>
      {!insideStudio && (
        <header className="border-b border-neutral-950/10">
          <div className="mx-auto flex min-h-18 max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 sm:px-8 lg:px-12">
            <div className="min-w-0 shrink-0 grow text-lg font-semibold tracking-tight">
              <Link
                className="inline-flex items-center gap-2.5"
                aria-label="Homepage"
                to={{ pathname: "/", search }}
              >
                <img src="/favicon.svg" alt="" className="size-6 shrink-0" />
                {libraryConfig.name}
              </Link>
            </div>
            {location.pathname === "/" && (
              <div className="w-full min-w-0 sm:w-auto sm:max-w-80">
                <StudioActions entry={null} variant="default" />
              </div>
            )}
          </div>
        </header>
      )}
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 sm:px-8 lg:px-12">
        <Outlet context={{ insideStudio, search }} />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main
      id="main"
      className="isolate mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-balance">
        {notFound ? "Page not found" : "The library couldn’t load"}
      </h1>
      <p className="mt-4 text-base text-pretty text-muted">
        {notFound
          ? "Choose an Element from the library."
          : "Reload the page and try again."}
      </p>
      <p className="mt-6 text-base sm:text-sm">
        <Link className="underline underline-offset-4 hover:text-accent" to="/">
          Back to the library
        </Link>
      </p>
    </main>
  );
}
