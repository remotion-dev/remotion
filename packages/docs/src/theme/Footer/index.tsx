import { useThemeConfig } from "@docusaurus/theme-common";
import React from "react";
import FooterLayout from "./Layout";
import FooterLinks from "./Links";

const Footer = () => {
  const { footer } = useThemeConfig();
  if (!footer) {
    return null;
  }

  const { links, style } = footer;
  return (
    <FooterLayout
      style={style}
      links={links && links.length > 0 && <FooterLinks links={links} />}
    />
  );
};

export default React.memo(Footer);
