import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import React from "react";

export const Seo = {
  Title: ({ children }: { children: string }) => {
    return (
      <>
        <title>{children}</title>
        <meta property="og:title" content={children} />
      </>
    );
  },
  Description: ({ children }: { children: string }) => {
    return (
      <>
        <meta name="description" content={children} />
        <meta property="og:description" content={children} />
      </>
    );
  },
  Image: ({ children }: { children: string }) => {
    const context = useDocusaurusContext();

    const imgSrc = new URL(children, context.siteConfig.url).href;

    return (
      <>
        <meta property="og:image" content={imgSrc} />
        <meta name="twitter:image" content={imgSrc} />
      </>
    );
  },
};
