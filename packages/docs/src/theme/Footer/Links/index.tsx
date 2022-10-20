import React from "react";
import FooterLinksMultiColumn from "./MultiColumn";

export default ({ links, style }) => {
  return <FooterLinksMultiColumn style={style} columns={links} />;
};
