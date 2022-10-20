import { useColorMode } from "@docusaurus/theme-common";
import LinkItem from "@theme/Footer/LinkItem";
import React from "react";

const footerTitle: React.CSSProperties = {
  fontFamily: "GT Planar",
};

const ColumnLinkItem = ({ item }) => {
  return item.html ? (
    <li
      // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: item.html }}
      className="footer__item"
    />
  ) : (
    <li key={item.href ?? item.to} className="footer__item">
      <LinkItem item={item} />
    </li>
  );
};

const Column = ({ column }) => {
  return (
    <div className="col footer__col">
      <div style={footerTitle} className="footer__title">
        {column.title}
      </div>
      <ul className="footer__items clean-list">
        {column.items.map((item, i) => (
          <ColumnLinkItem key={i} item={item} />
        ))}
      </ul>
    </div>
  );
};

const copyright: React.CSSProperties = {
  textAlign: "left",
  color: "var(--ifm-footer-link-color)",
  fontSize: "0.8em",
  marginTop: 15,
  marginRight: 38,
};

export default ({ columns }) => {
  const { isDarkTheme } = useColorMode();
  return (
    <div className="row footer__links">
      <div
        style={{
          padding: "0 var(--ifm-spacing-horizontal)",
          marginBottom: 20,
        }}
      >
        <img
          src={isDarkTheme ? "/img/remotion-white.png" : "/img/new-logo.png"}
          style={{
            height: 32,
            marginRight: 80,
          }}
        />
        <p style={copyright}>
          © Copyright {new Date().getFullYear()} Remotion AG. <br /> Website
          created with Docusaurus.
        </p>
      </div>
      {columns.map((column, i) => (
        <Column key={i} column={column} />
      ))}
    </div>
  );
};
