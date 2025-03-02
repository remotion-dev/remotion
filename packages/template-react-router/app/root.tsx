import {
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Remotion Starter",
    },
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width,initial-scale=1" },
    { property: "og:title", content: "Remotion + React Router" },
  ];
};
export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
