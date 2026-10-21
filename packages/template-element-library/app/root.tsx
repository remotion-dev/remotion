import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "react-router";
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

export default function Root() {
  return <Outlet />;
}

export function HydrateFallback() {
  return null;
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
