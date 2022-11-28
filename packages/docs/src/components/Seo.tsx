import React from "react";

export const Seo = {
  renderTitle: (title: string) => {
    return (
      <>
        <title>{title}</title>
        <meta property="og:title" content={title} />
      </>
    );
  },
  renderDescription: (title: string) => {
    return (
      <>
        <meta name="description" content={title} />
        <meta property="og:description" content={title} />
      </>
    );
  },
  renderImage: (title: string, domain: string) => {
    const imgSrc = new URL(title, domain).href;

    return (
      <>
        <meta property="og:image" content={imgSrc} />
        <meta name="twitter:image" content={imgSrc} />
      </>
    );
  },
};
