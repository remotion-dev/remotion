import { useColorMode } from "@docusaurus/theme-common";
import React from "react";

const containerStyle: React.CSSProperties = {};

const cardContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-start",
};

const avatarStyle: React.CSSProperties = {
  width: 70,
  height: 70,
  borderRadius: "50%",
  marginRight: "20px",
  flexShrink: 0,
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  fontSize: "0.9em",
  color: "#000000",
};

interface Contributor {
  username: string;
  contribution: string;
}

interface CreditsProps {
  contributors: Contributor[];
}

const ContributorComp: React.FC<{
  contributor: Contributor;
}> = ({ contributor }) => {
  const { colorMode } = useColorMode();

  const textColor = colorMode === "dark" ? "#ffffff" : "#000000";

  const cardStyle: React.CSSProperties = {
    maxWidth: "300px",
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
    display: "flex",
    color: textColor,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  };

  if (!contributor.username) {
    throw new Error("Contributor username is required");
  }

  if (!contributor.contribution) {
    throw new Error("Contributor contribution is required");
  }

  return (
    <a
      href={`https://github.com/${contributor.username}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...linkStyle, color: textColor }}
    >
      <div key={contributor.username} style={cardStyle}>
        <img
          src={`https://github.com/${contributor.username}.png`}
          alt={contributor.username}
          style={avatarStyle}
        />
        <div
          style={{
            color: textColor,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <strong>{contributor.username}</strong>
          <div
            style={{
              color: textColor,
              lineHeight: 1.4,
            }}
          >
            {contributor.contribution}
          </div>
        </div>
      </div>
    </a>
  );
};

const titleContainer: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
};

const titleLine: React.CSSProperties = {
  height: 1,
  backgroundColor: "var(--light-text-color)",
  flex: 1,
};

const title: React.CSSProperties = {
  marginRight: 10,
  fontFamily: "GT Planar",
  color: "var(--light-text-color)",
};

export const Credits: React.FC<CreditsProps> = ({ contributors }) => {
  return (
    <div style={containerStyle}>
      <div style={titleContainer}>
        <div style={title}>CONTRIBUTORS</div>
        <div style={titleLine} />
      </div>
      <div style={cardContainerStyle}>
        {contributors.map((contributor) => (
          <ContributorComp
            key={contributor.username}
            contributor={contributor}
          />
        ))}
      </div>
    </div>
  );
};
