import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import { CreateVideoInternals } from "create-video";
import React from "react";
import { IconForTemplate } from "../../components/IconForTemplate";
import styles from "./styles.module.css";

const content: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  padding: "0 20px",
};

const para: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 50,
};

export default () => {
  return (
    <Layout>
      <div style={content}>
        <h1 className={styles.title}>
          Find the right
          <br />
          template
        </h1>
        <p style={para}>
          Jumpstart your project with a template that fits your usecase.
        </p>
        <div className={styles.grid}>
          {CreateVideoInternals.FEATURED_TEMPLATES.map((template) => {
            return (
              <Link
                key={template.cliId}
                className={styles.item}
                style={outer}
                to={`/templates/${template.cliId}`}
              >
                <Item
                  label={template.homePageLabel}
                  description={template.description}
                >
                  <IconForTemplate scale={0.7} template={template} />
                </Item>
              </Link>
            );
          })}
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
    </Layout>
  );
};

const Item: React.FC<{
  label: string;
  description: React.ReactNode;
  children: React.ReactNode;
}> = ({ children, label, description }) => {
  return (
    <div>
      <div
        style={{ flexDirection: "row", display: "flex", alignItems: "center" }}
      >
        <div style={icon}>{children}</div>
        <div style={labelStyle}>{label}</div>
      </div>
      <div>
        <p style={descriptionStyle}>{description}</p>
      </div>
    </div>
  );
};

const outer: React.CSSProperties = {
  display: "flex",
  cursor: "pointer",
  color: "var(--text-color)",
  textDecoration: "none",
};

const icon: React.CSSProperties = {
  display: "flex",
  margin: 0,
  marginRight: 10,
  height: 30,
  width: 30,
  justifyContent: "center",
  alignItems: "center",
};

const labelStyle: React.CSSProperties = {
  fontWeight: "bold",
};

const descriptionStyle: React.CSSProperties = {
  fontSize: 14,
  marginTop: 10,
  color: "var(--light-text-color)",
  marginBottom: 10,
};
