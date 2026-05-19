import type {MetaFunction} from "react-router";

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
